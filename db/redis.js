var redis = require('redis'),
    client = redis.createClient();

client.on('error', function (err) {
    console.log('Error ' + err);
});

// If no key specified, use filename for some degree of uniqueness
var key = process.env.DBKEY || __filename;

exports.get = function(id, fn) {
  client.get(key, function(err, reply) {
    if (err) return fn(err);
    console.log(reply);
    reply = JSON.parse(reply);
    if (!reply || !reply[id]) return fn(new Error('Not found'));
    fn(null, reply[id]);
  });
};

exports.post = function(docs, fn) {
  // uncomment to reset
  //client.del(key);
  client.get(key, function(err, reply) {
    if (err) return fn(err);
    reply = JSON.parse(reply) || {};
    merge(reply, docs);
    client.set(key, JSON.stringify(reply), function(err, setReply) {
      if (err) return fn(err);
      fn(null, setReply);
    });
  });
};

exports.near = function(lat, lng, fn) {
  client.get(key, function(err, reply) {
    if (err) return fn(err);
    var db = JSON.parse(reply);
    for (var id in db) {
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
    return exports.get('settings', function(err, data){
      if (err) return fn(err);
      fn(null, data);
    });
  }
  exports.post({settings: doc}, fn);
};

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
