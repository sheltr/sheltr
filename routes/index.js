var request = require('request');
var _ = require('underscore');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('layout.html', {
      partials: {
        body: 'index.html',
        scripts: 'index-scripts.html'
      }
    });
  });
  app.get('/about', function(req, res) {
    res.render('layout.html', {partials: {body: 'about.html'}});
  });
  app.get('/hotline', function(req, res) {
    res.render('layout.html', {partials: {body: 'hotline.html'}});
  });
  app.get('/partners', function(req, res) {
    res.render('layout.html', {partials: {body: 'partners.html'}});
  });
  app.get('/admin', function(req, res) {
    if (!req.session.user) {
      res.writeHead(302, {'Location': '/login?ref=/admin'});
      return res.end();
    }
    res.render('layout.html', {partials: {body: 'admin.html'}});
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
        res.render('layout.html', {partials: {body: 'admin.html'}});
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
    res.render('layout.html', {partials: {body: 'login.html'}});
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
        res.render('layout.html', {
          message: 'No user found with that username and password.',
          partials: {body: 'login.html'}
        });
      });
    });
  });
  app.get('/logout', function(req, res) {
    req.session.destroy();
    res.render('layout.html', {partials: {body: 'logout.html'}});
  });
  //app.get(/^\/(\w{4})$/, function(req, res, next) {
  //  var id = req.params[0];
  //  https.get({
  //    host: 'api.cloudmine.me',
  //    path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+id,
  //    headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
  //  }, function(cmres) {
  //    var data = '';
  //    cmres.on('data', function(chunk) {
  //      data += chunk;
  //    }).on('end', function() {
  //      var parsed = JSON.parse(data);
  //      if (parsed.success && parsed.success[id]) {
  //        var loc = parsed.success[id];
  //      } else {
  //        return next();
  //      }
  //      loc.id = id;
  //      loc.raw = JSON.stringify(loc);
  //      loc.isShelterAndNotIntake = (loc.isShelter && !loc.isIntake);
  //      var context = {
  //        loc: loc,
  //        partials: {body: 'location.html'}
  //      };
  //      // TODO check permissions
  //      if (req.session.user) {
  //        context.edit = true;
  //      }
  //      res.render('layout.html', context);
  //    });
  //  }).on('error', function(e) {
  //    console.log(e);
  //    next();
  //  });
  //});
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
          loc: loc,
          partials: {body: 'edit_location.html'}
        };
        res.render('layout.html', context);
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
    //      submitted: JSON.stringify(req.body),
    //      partials: {body: 'edit_location.html'}
    //    };
    //    res.render('layout.html', context);
    //  });
    //}).on('error', function(e) {
    //  console.log(e);
    //  next();
    //});
  });
  app.get('/:idOrSlug', function(req, res, next) {
    // first param could be ID or slug
    // XXX replace ID in the db with slug when slug created?
    request('http://'+req.headers.host+'/api/loc/'+req.params.idOrSlug, function(err, apiRes, body) {
      if (err) return res.send(err);
      console.log(body);
      var parsed = JSON.parse(body);
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
        loc: loc,
        partials: {
          body: 'location.html',
          scripts: 'location-scripts.html'
        }
      };
      // TODO check permissions
      if (req.session.user) {
        context.edit = true;
      }
      res.render('layout.html', context);
    });
    //https.get({
    //  host: 'api.cloudmine.me',
    //  path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/search?q=[slug="'+slug+'"]',
    //  headers: {'X-CloudMine-ApiKey': process.env.CLOUDMINE}
    //}, function(cmres) {
    //  var data = '';
    //  cmres.on('data', function(chunk) {
    //    data += chunk;
    //  }).on('end', function() {
    //    var parsed = JSON.parse(data);
    //    // XXX this is kinda fragile says Mike
    //    var id = Object.keys(parsed.success)[0];
    //    if (parsed.success && parsed.success[id]) {
    //      var loc = parsed.success[id];
    //    } else {
    //      return next();
    //    }
    //    loc.id = id;
    //    loc.raw = JSON.stringify(loc);
    //    loc.isShelterAndNotIntake = (loc.isShelter && !loc.isIntake);
    //    var context = {
    //      loc: loc,
    //      partials: {body: 'location.html'}
    //    };
    //    // TODO check permissions
    //    if (req.session.user) {
    //      context.edit = true;
    //    }
    //    res.render('layout.html', context);
    //  });
    //}).on('error', function(e) {
    //  console.log(e);
    //  next();
    //});
  });
};
