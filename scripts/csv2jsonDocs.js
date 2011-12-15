var csv = require('csv');
var fs = require('fs');

// base32 according to http://www.crockford.com/wrmg/base32.html
var alphabet = '0123456789abcdefghjkmnpqrstvwxyz'

function randomChar() {
  var randomNum = Math.floor(Math.random() * 32);
  return alphabet.charAt(randomNum);
}

function generateID() {
  var id = '';
  for (var i=0; i<4; i++) {
    id += randomChar();
  }
  return id;
}

function merge(doc) {
  var id = generateID();
  if (merged[id]) {
    // don't overwrite existing IDs
    merge(doc);
  } else {
    merged[id] = doc;
  }
}

var merged = {};
var loadedFile = fs.readFileSync('loaded.json');
var loaded = JSON.parse(loadedFile);
for (var key in loaded.success) {
  merge(loaded.success[key]);
}

var foodCupboardsFile = fs.readFileSync('food-cupboards.json');
var foodCupboards = JSON.parse(foodCupboardsFile);
for (var i=0, l=foodCupboards.length; i<l; i++) {
  merge(foodCupboards[i]);
}

fs.writeFile('merged.json', JSON.stringify(merged));
