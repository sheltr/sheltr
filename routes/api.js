var db = require('../db');

module.exports = function(app) {
  app.get('/api/near', function(req, res, next) {
    db.near(req.query.lat, req.query.lng, function(err, data) {
      if (err) return res.send(err);
      res.send(data);
    });
  });
};
