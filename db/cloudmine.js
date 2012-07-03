var request = require('request');
var _ = require('underscore');

if (!(process.env.CMID && process.env.CMKEY)) {
  console.error('Define env vars for CMID and CMKEY');
}

exports.get = function(id, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?keys='+id,
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY},
    json: true
  }, function(err, res, body) {
    if (err) return fn(err);
    if (!body.success || _.isEmpty(body.success)) return fn(body);
    fn(null, body.success);
  });
};

exports.post = function(doc, fn) {
  request({
    method: 'POST',
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text',
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY},
    json: doc
  }, function(err, res, body) {
    if (err) return fn(err);
    if (!body.success || _.isEmpty(body.success)) return fn(body);
    fn(null, body);
  });
};

exports.near = function(lat, lng, fn) {
  var url = encodeURI('https://api.cloudmine.me/v1/app/'+process.env.CMID+'/search?q=[location near ('+lng+', '+lat+')]');
  //console.log(url);
  request({
    url: url,
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY},
    json: true
  }, function(err, res, body) {
    if (err) return fn(err);
    if (!body.success || _.isEmpty(body.success)) return fn(body);
    var locations = [],
        locObj = body.success;
    //console.log(locObj);
    for (var id in locObj) {
      locObj[id].id = id;
      locations.push(locObj[id]);
    }
    fn(null, locations);
  });
};

exports.loc = function(idOrSlug, fn) {
  exports.get(idOrSlug, function(err, data) {
    if (err) return exports.getBySlug(idOrSlug, fn);
    fn(null, data);
  });
};

exports.getBySlug = function(slug, fn) {
  request({
    url: encodeURI('https://api.cloudmine.me/v1/app/'+process.env.CMID+'/search?q=[slug="'+slug+'"]'),
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    if (_.isEmpty(JSON.parse(body).success)) return fn(body);
    fn(null, body);
  });
};

exports.settings = function(doc, fn) {
  // get settings if no doc param
  if (!fn) {
    fn = doc;
    return exports.get('settings', function(err, body){
      if (err) return fn(err);
      fn(null, body.settings);
    });
  }
  exports.post({settings: doc}, fn);
};
