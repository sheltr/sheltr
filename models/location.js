var currentSchema = {
  name: {type: 'String'},
  address1: {type: 'String'},
  address2: {type: 'String'},
  city: {type: 'String'},
  state: {type: 'String'},
  postalCode: {type: 'Number'},
  longitude: {type: 'Number'},
  latitude: {type: 'Number'},
  phone: {type: 'String'},
  type: {type: 'String'},
  url: {type: 'String'},
  isShelter: {type: 'String'},
  isIntake: {type: 'String'},
  hasMeals: {type: 'String'},
  isFood: {type: 'String'},
  isFamily: {type: 'String'},
  isPublic: {type: 'String'},
  isPrivate: {type: 'String'},
  isChildren: {type: 'String'},
  isWomen: {type: 'String'},
  isMen: {type: 'String'},
  isDayCenter: {type: 'String'},
  otherLimits: {type: 'String'},
  oshReferralRequired: {type: 'Boolean'},
  oadReferralRequired: {type: 'Boolean'},
  hours: {type: 'String'},
  otherServices: {type: 'String'},
  notes: {type: 'String'},
  services: ['service_name_here']
};

var Services = {
  type: {type: 'String'}
};

var OperatingHours = {
  day: {type: 'String', enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']},
  time_starts: {type: 'String'},
  time_ends: {type: 'String'},
  isAllDay: {type: 'Boolean', 'default': false},
  notes: {type: 'String'}
};

var Statuses = {
  status: {type: 'String'},
  username: {type: 'String'},
  created: {type: 'Date'}
};

/**
 * Removed type, hours, url, otherServices, hasMeals, isPublic -- as these are now covered elsewhere in the schema
 */
var proposedSchema = {
  _intake: {type: 'ObjectId', ref: 'Location'},
  name: {type: 'String'},
  Address: { //added for organization
    address1: {type: 'String'},
    address2: {type: 'String'},
    city: {type: 'String'},
    state: {type: 'String'},
    postalCode: {type: 'String'}
  },
  location: { //Cloudmine-specific formatting
    "__type__": {type: 'String', "default": 'geopoint'},
    longitude: {type: 'Number'},
    latitude: {type: 'Number'}
  },
  phone: {type: 'String'},
  website: {type: 'String'}, //added
  donate_url: {type: 'String'}, //added
  facebook: {type: 'String'}, //added
  twitter: {type: 'String'}, //added. todo: validate for no '@' prefix
  Services: [Services], //capitalized, Services schema revised
  Statuses: [Statuses], //added
  OperatingHours: [OperatingHours], //added
  notes: {type: 'String'},
  access: {type: 'String'},  //added
  contact_name: {type: 'String'}, //added
  isShelter: {type: 'Boolean'}, //convert to boolean
  isIntake: {type: 'String'}, //migrate to Services, convert to service type
  isFood: {type: 'Boolean'}, //convert to boolean
  isPrivate: {type: 'Boolean'},
  isVolunteerNeeded: {type: 'Boolean'}, //added
  isOshReferralRequired: {type: 'Boolean'}, //renamed
  isOadReferralRequired: {type: 'Boolean'}, //renamed
  LegacyData: { //Embed for usused legacy data.  Convert appropriate fields to Booleans
    isFamily: {type: 'Boolean'},
    isChildren: {type: 'Boolean'},
    isWomen: {type: 'Boolean'},
    isMen: {type: 'Boolean'},
    isDayCenter: {type: 'Boolean'},
    otherLimits: {type: 'String'},
    otherServices: {type: 'String'},
    hours: {type: 'String'}
  }
};