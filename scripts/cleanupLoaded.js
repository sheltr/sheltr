var fs = require('fs');

function convertStringToBoolean(string) {

  return (string === 'Y')

}

var loadedFile = fs.readFileSync('loaded.json');
var loaded = JSON.parse(loadedFile);
var data, newData, reloaded = {};

var booleans = {
  isShelter: true,
  isIntake: true,
  isPrivate: true,
  isFood: true,
  oshReferralRequired: true,
  oadReferralRequired: true,
  isFamily: true,
  isChildren: true,
  isWomen: true,
  isMen: true,
  isDayCenter: true
};

var mapped_fields = {
  Address: {
    address1: true,
    address2: true,
    city: true,
    state: true,
    postalCode: true
  },
  LegacyData: {
    isFamily: true,
    isChildren: true,
    isWomen: true,
    isMen: true,
    isDayCenter: true,
    otherLimits: true,
    otherServices: true,
    hours: true
  },
  location: {
    "__type__": true, //Need special accommodation to set as "geopoint"
    longitude: true,
    latitude: true
  },
  name: true,
  phone: true,
  url: 'website',
  notes: true,
  isShelter: true,
  isIntake: true,
  isFood: true,
  isPrivate: true,
  oshReferralRequired: 'isOshReferralRequired',
  oadReferralRequired: 'isOadReferralRequired'
};

for (var key in loaded.success) {
  data = loaded.success[key];
  newData = {
    Address: {},
    location: {},
    LegacyData: {}
  };
  for (var dataKey in data) {

    /**
     * Converting String fields to Booleans
     */
    if (booleans.hasOwnProperty(dataKey)) {
        data[dataKey] = (data[dataKey] === 'Y' || data[dataKey] === true);
    }

    /**
     * Mapping data to new schema
     */
    
    //Addresses
    if (mapped_fields.Address.hasOwnProperty(dataKey)) {
      if (mapped_fields.Address[dataKey] === true) {
        newData['Address'][dataKey] = data[dataKey];
      } else {
        newData['Address'][mapped_fields.Address[dataKey]] = data[dataKey];
      }
    }
    
    //location
    else if (mapped_fields.location.hasOwnProperty(dataKey)) {
      if (mapped_fields.location[dataKey] === true) {
        newData['location'][dataKey] = data[dataKey];
      } else {
        newData['location'][mapped_fields.LegacyData[dataKey]] = data[dataKey];
      }
    }

    //LegacyData
    else if (mapped_fields.LegacyData.hasOwnProperty(dataKey)) {
      if (mapped_fields.LegacyData[dataKey] === true) {
        newData['LegacyData'][dataKey] = data[dataKey];
      } else {
        newData['LegacyData'][mapped_fields.LegacyData[dataKey]] = data[dataKey];
      }
    }
    
    //Top-level data
    else if (mapped_fields.hasOwnProperty(dataKey)) {
      if (mapped_fields[dataKey] === true) {
        newData[dataKey] = data[dataKey];
      } else {
        newData[mapped_fields.LegacyData[dataKey]] = data[dataKey];
      }
    }

    //Manually set location __type__
    if (newData.hasOwnProperty('location')) {
      newData.location['__type__'] = 'geopoint';
    }
    
  }

  console.log(data);
  console.log(newData);
  break;

  //data.Type = 'location';
  //if (data.MealNotes) {
  //  data.IsFood = 'Y';
  //}
  reloaded[key] = newData;
}
//fs.writeFile('reloaded.json', JSON.stringify(reloaded));
//
function deCap(str) {
  return str.charAt(0).toLowerCase() + str.substr(1);
}
