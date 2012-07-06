var redis = require('redis'),
    client = redis.createClient();

client.on('error', function (err) {
    console.log('Error ' + err);
});

// If no key specified, use filename for some degree of uniqueness
var key = process.env.DBKEY || __filename;

exports.get = function(id, cb) {
  client.get(key, function(err, reply) {
    if (err) return cb(err);
    console.log(reply);
    reply = JSON.parse(reply);
    if (!reply || !reply[id]) return cb(new Error('Not found'));
    cb(null, reply[id]);
  });
};

exports.post = function(docs, cb) {
  // uncomment to reset
  //client.del(key);
  client.get(key, function(err, reply) {
    if (err) return cb(err);
    reply = JSON.parse(reply) || {};
    merge(reply, docs);
    client.set(key, JSON.stringify(reply), function(err, setReply) {
      if (err) return cb(err);
      cb(null, setReply);
    });
  });
};

exports.near = function(lat, lon, limit, cb) {
  var _limit;
  if (cb) {
    _limit = limit || 20;
  } else {
    cb = limit;
    _limit = 20;
  }
  client.get(key, function(err, reply) {
    if (err) return cb(err);
    var db = JSON.parse(reply);
    var doc, distance, distances = [];
    for (var id in db) {
      doc = db[id];
      if (doc.location) {
        distance = getDistance(lat, doc.location.lat, lon, doc.location.lon)
        distances.push(distance)
        distances.sort()
        // TODO link distances to IDs
        if (distances.length > _limit) distances.pop();
      }
      //locObj[id].id = id;
      //locations.push(locObj[id]);
    }
    cb(null, distances);
  });
};

exports.loc = function(idOrSlug, cb) {
  exports.get(idOrSlug, function(err, data) {
    if (err) return exports.getBySlug(idOrSlug, cb);
    cb(null, data);
  });
};

exports.getBySlug = function(slug, cb) {
  //request({
  //  url: encodeURI('https://api.cloudmine.me/v1/app/'+process.env.CMID+'/search?q=[slug="'+slug+'"]'),
  //  headers: {'X-CloudMine-ApiKey': process.env.CMKEY}
  //}, function(err, res, body) {
  //  if (err) return cb(err);
  //  if (_.isEmpty(JSON.parse(body).success)) return cb(body);
  //  cb(null, body);
  //});
};

exports.settings = function(doc, cb) {
  // get settings if no doc param
  if (!cb) {
    cb = doc;
    return exports.get('settings', function(err, data){
      if (err) return cb(err);
      cb(null, data);
    });
  }
  exports.post({settings: doc}, cb);
};

function getDistance(x1, y1, x2, y2) {
  function sq(x) {return x*x}
  return Math.sqrt(sq(x2-x1)+sq(y2-y1))
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
