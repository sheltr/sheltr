var request = require('request');

exports.near = function(lat, lng, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?f=shelters_near&result_only=true&params={%22center%22:['+lat+','+lng+']}',
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY},
    json: true
  }, function(err, res, body) {
    if (err) return fn(err);
    fn(null, body);
  });
};

exports.loc = function(idOrSlug, fn) {
  if (idOrSlug.length != 4) { // not an ID
    return exports.locBySlug(idOrSlug, fn);
  } 
  exports.locById(idOrSlug, function(err, data) {
    if (err) return fn(err);
    console.log(data);
    // if results return
    if (blah) {
      return fn(null, data);
    }
    exports.locBySlug(idOrSlug, function(err, data) {
      if (err) return fn(err);
      fn(null, data);
    });
  });
};

exports.locById = function(id, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?keys='+id,
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    fn(null, body);
  });
};

exports.locBySlug = function(slug, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/search?q=[slug="'+slug+'"]',
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    fn(null, body);
  });
};
