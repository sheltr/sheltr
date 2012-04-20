var db = require('../db');

module.exports = function(app) {
  app.get('/api/near', function(req, res) {
    db.near(req.query.lat, req.query.lng, function(err, data) {
      if (err) return res.send(err);
      res.send(data);
    });
  });
  app.get('/api/loc/:idOrSlug', function(req, res) {
    db.loc(req.params.idOrSlug, function(err, data) {
      if (err) return res.send(err);
      res.send(data);
    });
  });
};
