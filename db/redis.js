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
    //console.log(reply);
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
    var doc;
    var distance;
    var distances = [];
    var docByDistance = {};
    var limited;
    var result = [];
    for (var id in db) {
      doc = db[id];
      if (doc.latitude && doc.longitude) {
        distance = getDistance(lat, lon, doc.latitude, doc.longitude)
        distances.push(distance)
        doc.distance = distance
        doc.id = id
        docByDistance[distance] = doc
        //distances.sort()
        // TODO link distances to IDs
        //if (distances.length > _limit) distances.pop();
      }
      //locObj[id].id = id;
      //locations.push(locObj[id]);
    }
    distances.sort()
    limited = distances.slice(0,20)
    for (var i=0; i < limited.length; i++) {
      // reuse doc var
      // we assume the distance is unique
      doc = docByDistance[limited[i]]
      result.push(doc)
    }
    cb(null, result);
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
  //console.log(doc)
  exports.post({settings: doc}, cb);
};

function getDistance(lat1, lon1, lat2, lon2) {
  //function sq(x) {return x*x}
  //return Math.sqrt(sq(x2-x1)+sq(y2-y1))
  var R = 3959; // miles
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180; 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
