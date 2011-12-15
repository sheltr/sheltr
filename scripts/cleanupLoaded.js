var fs = require('fs');

var loadedFile = fs.readFileSync('loaded.json');
var loaded = JSON.parse(loadedFile);
var data, reloaded = {};
for (var key in loaded.success) {
  data = loaded.success[key];
  //data.IsPublic = '';
  //data.IsPrivate = '';
  //if (data.Type == 'Public') {
  //  data.IsPublic = 'Y';
  //} else if (data.Type == 'Private') {
  //  data.IsPrivate = 'Y';
  //}
  //data.Type = 'location';
  //if (data.MealNotes) {
  //  data.IsFood = 'Y';
  //}
  //data.Latitude = Number(data.Latitude);
  //data.Longitude = Number(data.Longitude);
  if (data.Services == 'Soup Kitchen') {
    reloaded[key] = data;
  }
}
fs.writeFile('reloaded.json', JSON.stringify(reloaded));
