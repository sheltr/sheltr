//sh.njdata.js
var request = require('request');
var csv = require('csv');
var fs = require('fs');

// cloudmine env variables
var CM_APP = 'b74254d53d5b44f094cea522c204ffca';
var CM_KEY = process.env.CLOUDMINE;

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

function pushToCloudMine(data) {
  //var s = JSON.stringify(data);
  //console.log(s);
  request.put({
    uri: 'https://api.cloudmine.me/v1/app/' + CM_APP + '/text',
    headers: {'X-CloudMine-ApiKey': CM_KEY},
    json: data
  }, function (err, cmres, body) {
    if (!err && cmres.statusCode === 200) {
      console.log('posted!');
    } else {
      console.log(body);
    }
  });
}

var idBucket = {};

csv()
.fromPath(__dirname+'/../data/nj.csv', {columns:true})
.on('data', function(data, index){
  var output = {};

  //get the phone number
  if (data.Contact) {
    if (data.Contact.search(':: ') === -1) {
      data.phone = data.Contact;
    } else {
      var contact = data.Contact.split(':: ');
      data.phone = contact[1];
    }
  }

  data.name = data.Program;
  data.county = data.County;
  data.state = 'NJ';
  data.type = 'location';
  data.isSheltr = 'Y';
  data.totalBeds = data['Units/Beds'];
  data.occupiedBeds = data.Occupied;
  data.openBeds = data.Open;
  data.otherLimits = data.Population;
  data.notes = data.Agency;
  data.location = {
      "__type__": "geopoint",
      "longitude": 0,
      "latitude": 0
  };

  delete data['Units/Beds'];
  delete data.Occupied;
  delete data.Open;
  delete data.Population;
  delete data.Contact;
  delete data.Agency;
  delete data.Program;
  delete data.County;

  var id = newId();
  output[id] = data;
  pushToCloudMine(output);
})
.on('end',function(){
})
.on('error',function(error){
    console.log(error.message);
});