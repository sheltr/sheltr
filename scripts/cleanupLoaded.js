var fs = require('fs');

var loadedFile = fs.readFileSync('loaded.json');
var loaded = JSON.parse(loadedFile);
var data, newData, reloaded = {};
for (var key in loaded.success) {
  data = loaded.success[key];
  console.log(data);
  break;
  newData = {};
  for (var dataKey in data) {
    if (dataKey == 'OSHReferralRequired') {
      newData.oshReferralRequired = data[dataKey];
    } else if (dataKey == 'OADReferralRequired') {
      newData.oadReferralRequired = data[dataKey];
    } else {
      newData[deCap(dataKey)] = data[dataKey];
    }
  }
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
  //if (data.IsShelter) {
  reloaded[key] = newData;
  //}
}
//fs.writeFile('reloaded.json', JSON.stringify(reloaded));
//
//function deCap(str) {
//  return str.charAt(0).toLowerCase() + str.substr(1);
//}
