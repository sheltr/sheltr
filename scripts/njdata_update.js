//njdata_update.js
var request = require('request');
var csv = require('csv');
var fs = require('fs');

// cloudmine env variables
var CM_APP = 'b74254d53d5b44f094cea522c204ffca';
var CM_KEY = process.env.CLOUDMINE;

function getLocations() {
  request({
    uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text?&limit=-1',
    headers: {'X-CloudMine-ApiKey': CM_KEY},
  }, function (err, cmres, body) {
    if (!err && cmres.statusCode === 200) {
      syncBeds(JSON.parse(body).success);
    } else {
      console.log(body);
    }
  });
}

function syncBeds(locations) {
  csv()
    .fromPath(__dirname+'/../data/nj.csv', {columns:true})
    .on('data', function(data, index){
      var location;

      for(location in locations) {
        if (locations.hasOwnProperty(location)) {
          if (data.Program === locations[location].name) {
            locations[location].occupiedBeds = data.Occupied;
            locations[location].openBeds = data.Open;
            locations[location].totalBeds = data['Units/Beds'];
          }
        }
      }
    })
    .on('end',function(){
      request.post({
        uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text',
        headers: {'X-CloudMine-ApiKey': CM_KEY},
        json: locations
      }, function (err, cmres, body) {
        if (!err && cmres.statusCode === 200) {
          console.log(locations);
        } else {
          console.log(body);
        }
      });
    })
    .on('error',function(error){
        console.log(error.message);
    });
}

getLocations();