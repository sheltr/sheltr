var connect = require('connect');
var https = require('https');
var snout = require('snout');
var whiskers = require('whiskers');

var templates = snout.sniff(__dirname+'/templates');

exports.route = function(app) {
  app.get('/', function(req, res) {
    res.render(templates.index);
  });
  app.get('/about', function(req, res) {
    res.render(templates.about);
  });
  app.get('/hotline', function(req, res) {
    res.render(templates.hotline);
  });
  app.get('/partners', function(req, res) {
    res.render(templates.partners);
  });
  app.get('/admin', function(req, res) {
    res.render(templates.admin);
  });
  app.get('/l/:id', function(req, res, next) {
    var id = req.params.id;
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+id,
      headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        var parsed = JSON.parse(data);
        if (parsed.success && parsed.success[id]) {
          var loc = parsed.success[id];
        } else {
          return next();
        }
        loc.id = id;
        loc.raw = JSON.stringify(loc);
        loc.isShelterAndNotIntake = (loc.isShelter && !loc.isIntake);
        var context = {
          //edit: true, // TODO move to req.user.edit
          loc: loc
        };
        res.render(templates.location, context);
      });
    }).on('error', function(e) {
      console.log(e);
      next();
    });
  });
  app.get('/l/:id/edit', function(req, res, next) {
    var id = req.params.id;
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+id,
      headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        var parsed = JSON.parse(data);
        if (parsed.success && parsed.success[id]) {
          var loc = parsed.success[id];
        } else {
          return next();
        }
        loc.id = id;
        loc.raw = JSON.stringify(loc);
        var context = {
          loc: loc
        };
        res.render(templates.edit_location, context);
      });
    }).on('error', function(e) {
      console.log(e);
      next();
    });
  });
  app.get('/_map', function(req, res) {
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?f=shelters_near&result_only=true&params={"center":['+req.query.lat+','+req.query.long+']}',
      headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    }, function(cmres) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      cmres.on('data', function(chunk) {
        res.write(chunk);
      }).on('end', function() {
        res.end();
      });
    }).on('error', function(e) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end('{"error":"'+e+'"}');
    });
  });
};

// easy rendering with whiskers
exports.renderer = function() {
  return function(req, res, next) {
    res.render = function(template, context) {
      context = connect.utils.merge({
        //user: true, // to be populated by req.user,
        gaAccount: process.env.GA
      }, context);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(whiskers.render(template, context, templates.partials));
    };
    next();
  };
};

