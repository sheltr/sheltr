//njdata_update.js
var request = require('request');
var csv = require('csv');
var fs = require('fs');

// cloudmine env variables
var CM_APP = 'b74254d53d5b44f094cea522c204ffca';
var CM_KEY = process.env.CLOUDMINE;

/* workflow:
1. parse updated Project Reach Dataset
2. For each location, query cloudmine based on Program/name, to get unique id of location
3. Now that we have the id, use that to update the bed count for that location
*/

function queryCM(name) {
  //query cloudmine based off Program/name
  //return id
  //pass id to function that will do a PUT to update bed count
}

csv()
.fromPath(__dirname+'/../data/nj.csv', {columns:true})
.on('data', function(data, index){
  var beds = {
    occupiedBeds = data.Occupied;
    openBeds = data.Open;
    otherLimits = data.Population;
  };

  var id = queryCM(data.Program);
  syncBeds(id, beds);
})
.on('end',function(){
})
.on('error',function(error){
    console.log(error.message);
});