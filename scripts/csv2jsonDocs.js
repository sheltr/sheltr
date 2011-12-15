var argv = require('optimist').demand(1).argv;
var csv = require('csv');
var fs = require('fs');

// base32 according to http://www.crockford.com/wrmg/base32.html
var alphabet = '0123456789abcdefghjkmnpqrstvwxyz'

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
var loadedFile = fs.readFileSync('loaded.json');
var loaded = JSON.parse(loadedFile);
for (var key in loaded) {
  idBucket[key] = '';
}

var count = 0;
var out = fs.createWriteStream('out.json');
out.write('{');
csv().fromPath(argv._[0], {columns:true})
.toStream(out, {end: false})
.transform(function(data) {
  data.Services = data.Type;
  data.Type = 'location';
  data.IsFood = 'Y';
  // first key is not prepended with a comma
  if (count) {
    process.stdout.write('.');
    count++;
    return ',"'+newId()+'":'+JSON.stringify(data);
  }
  process.stdout.write('|');
  count++;
  return '"'+newId()+'":'+JSON.stringify(data);
})
.on('error', function(err) {
  console.log(err.message);
});

process.on('exit', function() {
  process.stdout.write(count+'\n');
  out.end('}');
});
