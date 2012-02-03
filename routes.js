var connect = require('connect');
var https = require('https');
var snout = require('snout');
var whiskers = require('whiskers');
var _ = require('underscore');

var templates = snout.sniff(__dirname+'/templates');

exports.route = function(app) {
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
    console.log(JSON.stringify(req.session));
    if (!req.session.user) {
      res.writeHead(302, {'Location': '/login?ref=/admin'});
      return res.end();
    }
    res.render(templates.admin);
  });
  app.post('/admin', function(req, res) {
    if (!req.session.user) {
      res.writeHead(302, {'Location': '/login?ref=/admin'});
      return res.end();
    }
    var cmreq = https.request({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text',
      headers: {'Content-Type': 'application/json', 
        'X-CloudMine-ApiKey': process.env.CLOUDMINE},
      method: 'POST'
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        var parsed = JSON.parse(data);
        res.render(templates.admin, {response: data});
      });
    });
    var postdata = {};
    postdata[req.body.user] = {
      name: req.body.user,
      email: req.body.email,
      password: req.body.pass
    };
    cmreq.end(JSON.stringify(postdata));
  });
  app.get('/login', function(req, res) {
    res.render(templates.login);
  });
  app.post('/login', function(req, res) {
    // TODO also attach perms to user
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+req.body.user,
      headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        var parsed = JSON.parse(data);
        if (parsed.success && parsed.success[req.body.user]) {
          var user = parsed.success[req.body.user];
          if (req.body.pass === user.password) {
            req.session.user = user;
            res.writeHead(302, {'Location': '/admin'});
            return res.end();
          }
        } 
        res.render(templates.login, {message: 'No user found with that username and password.'});
      });
    });
  });
  app.get('/logout', function(req, res) {
    req.session.destroy();
    console.log(JSON.stringify(req.session));
    res.render(templates.logout);
  });
  app.get(/^\/(\w{4})$/, function(req, res, next) {
    var id = req.params[0];
    console.log(id);
    console.log(req.session);
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
          loc: loc
        };
        // TODO check permissions
        if (req.session.user) {
          context['edit'] = true;
        }
        res.render(templates.location, context);
      });
    }).on('error', function(e) {
      console.log(e);
      next();
    });
  });
  app.get(/^\/(\w{4})\/edit$/, function(req, res, next) {
    if (!req.session.user) {
      res.writeHead(302, {'Location': '/login'});
      return res.end();
    }
    // TODO check for user permissions
    var id = req.params[0];
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
  app.post(/^\/(\w{4})\/edit$/, function(req, res, next) {
    if (!req.session.user) {
      res.writeHead(302, {'Location': '/login'});
      return res.end();
    }
    var id = req.params[0];
    // TODO check for user permissions
    console.log(JSON.stringify(req.body));
    var cmreq = https.request({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text',
      headers: {'Content-Type': 'application/json', 
        'X-CloudMine-ApiKey': process.env.CLOUDMINE},
      method: 'POST'
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        console.log(data);
        var parsed = JSON.parse(data);
        // TODO what to do with errors
        if (_.isEmpty(parsed.errors)) {
          res.writeHead(302, {'Location': '/'+id});
          return res.end();
        }
      });
    });
    var postdata = {};
    postdata[id] = req.body;
    cmreq.end(JSON.stringify(postdata));
    // TODO validation -- show following?
    //var id = req.params[0];
    //https.get({
    //  host: 'api.cloudmine.me',
    //  path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+id,
    //  headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    //}, function(cmres) {
    //  var data = '';
    //  cmres.on('data', function(chunk) {
    //    data += chunk;
    //  }).on('end', function() {
    //    var parsed = JSON.parse(data);
    //    if (parsed.success && parsed.success[id]) {
    //      var loc = parsed.success[id];
    //    } else {
    //      return next();
    //    }
    //    loc.id = id;
    //    loc.raw = JSON.stringify(loc);
    //    var context = {
    //      loc: loc,
    //      submitted: JSON.stringify(req.body)
    //    };
    //    res.render(templates.edit_location, context);
    //  });
    //}).on('error', function(e) {
    //  console.log(e);
    //  next();
    //});
  });
  app.get(/^\/(\w+)$/, function(req, res, next) {
    var slug = req.params[0];
    console.log(slug);
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/search?q=[slug="'+slug+'"]',
      headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    }, function(cmres) {
      var data = '';
      cmres.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        console.log(data);
        var parsed = JSON.parse(data);
        // XXX this is kinda fragile says Mike
        var id = Object.keys(parsed.success)[0];
        if (parsed.success && parsed.success[id]) {
          var loc = parsed.success[id];
        } else {
          return next();
        }
        loc.id = id;
        loc.raw = JSON.stringify(loc);
        loc.isShelterAndNotIntake = (loc.isShelter && !loc.isIntake);
        var context = {
          loc: loc
        };
        // TODO check permissions
        if (req.session.user) {
          context['edit'] = true;
        }
        res.render(templates.location, context);
      });
    }).on('error', function(e) {
      console.log(e);
      next();
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

