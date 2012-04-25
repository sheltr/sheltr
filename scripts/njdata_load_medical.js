//sh.njdata.js
var request = require('request');
var csv = require('csv');
var fs = require('fs');

// cloudmine env variables
var CM_APP = 'b74254d53d5b44f094cea522c204ffca';
var CM_KEY = process.env.CMKEY;

// base32 according to http://www.crockford.com/wrmg/base32.html
var alphabet = '0123456789abcdefghjkmnpqrstvwxyz';

function randomChar() {
  var randomNum = Math.floor(Math.random() * 32);
  return alphabet.charAt(randomNum);
}

function generateId() {
  var id = '';
  for (var i=0; i<4; i++) {
    id += randomChar();
  }
  return id;
}

function newId() {
  var id = generateId();
  if (idBucket[id]) {
    // don't overwrite existing IDs
    newId();
  } else {
    idBucket[id] = '';
    return id;
  }
}

var idBucket = {};
var output = {};

csv()
  .fromPath(__dirname+'/../data/nj_medical.csv', {columns:true})
  .on('data', function(data, index){
    var id = newId();
    output[id] = {};

    output[id].name = data.Name;
    output[id].address1 = data.Address1;
    output[id].address2 = data.Address2;
    output[id].city = data.City;
    output[id].state = 'NJ';
    output[id].zip = data.Zip;
    output[id].type = 'location';
    output[id].isMedical = 'Y';
    output[id].otherLimits = data.Population;
    output[id].notes = data.ServiceType;
    output[id].location = {
        "__type__": "geopoint",
        "longitude": parseFloat(data.Lng),
        "latitude": parseFloat(data.Lat)
    };
  })
  .on('end',function(){
    request.put({
      uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text',
      headers: {'X-CloudMine-ApiKey': CM_KEY},
      json: output
    }, function (err, cmres, body) {
      if (!err && cmres.statusCode === 200) {
        console.log('posted!');
      } else {
        console.log(body);
      }
    });
  })
  .on('error',function(error){
      console.log(error.message);
  });