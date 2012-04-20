//njdata_update.js
var request = require('request');
var csv = require('csv');

// cloudmine env variables
var CM_APP = 'b74254d53d5b44f094cea522c204ffca';
var CM_KEY = process.env.CLOUDMINE;

// Get the latest shelter data from NJ Agency
// Pass it along to getCMData
function getUpdatedData() {
  request('https://hmis.njhmfaserv.org/lst/pol.php?id=24',
    function (err, res, body) {
      if (!err && res.statusCode === 200) {
        getCMData(body);
      } else {
        console.log(err, body);
      }
    }
  );
}

// Get the existing shelter data from CloudMine
// Call syncBeds() and pass along agency data and CloudMine data
function getCMData(data) {
  request({
    uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text?&limit=-1',
    headers: {'X-CloudMine-ApiKey': CM_KEY},
  }, function (err, cmres, body) {
    if (!err && cmres.statusCode === 200) {
      syncBeds(JSON.parse(body).success, data);
    } else {
      console.log(body);
    }
  });
}

// Update the CloudMine data with the updated NJ Agency data
// then POST the updated CloudMine data back to CloudMine
// Just updatind bed numbers at the moment.
function syncBeds(cmData, updatedData) {
  csv()
    .from(updatedData, {columns:true})
    .on('data', function(data, index){
      var location;

      for(location in cmData) {
        if (cmData.hasOwnProperty(location)) {
          if (updatedData.Program === cmData[location].name) {
            cmData[location].occupiedBeds = updatedData.Occupied;
            cmData[location].openBeds = updatedData.Open;
            cmData[location].totalBeds = updatedData['Units/Beds'];
          }
        }
      }
    })
    .on('end',function(){
      request.post({
        uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text',
        headers: {'X-CloudMine-ApiKey': CM_KEY},
        json: cmData
      }, function (err, cmres, body) {
        if (!err && cmres.statusCode === 200) {
          console.log('success!');
        } else {
          console.log(err, body);
        }
      });
    })
    .on('error',function(error){
        console.log(error.message);
    });
}

getUpdatedData();