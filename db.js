var request = require('request');
var _ = require('underscore');

exports.get = function(id, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?keys='+id,
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    fn(null, body);
  });
};

exports.near = function(lat, lng, fn) {
  request({
    url: encodeURI('https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?f=shelters_near&result_only=true&params={"center":['+lat+','+lng+']}'),
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY},
    json: true
  }, function(err, res, body) {
    if (err) return fn(err);
    fn(null, body);
  });
};

exports.loc = function(idOrSlug, fn) {
  exports.locById(idOrSlug, function(err, data) {
    if (err) return exports.locBySlug(idOrSlug, fn);
    fn(null, data);
  });
};

exports.locById = function(id, fn) {
  request({
    url: 'https://api.cloudmine.me/v1/app/'+process.env.CMID+'/text?keys='+id,
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    if (_.isEmpty(JSON.parse(body).success)) return fn(err);
    fn(null, body);
  });
};

exports.locBySlug = function(slug, fn) {
  request({
    url: encodeURI('https://api.cloudmine.me/v1/app/'+process.env.CMID+'/search?q=[slug="'+slug+'"]'),
    headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  }, function(err, res, body) {
    if (err) return fn(err);
    if (_.isEmpty(JSON.parse(body).success)) return fn(err);
    fn(null, body);
  });
};
