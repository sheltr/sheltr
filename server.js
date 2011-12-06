var connect = require('connect');
var https = require('https');
var snout = require('snout');
var whiskers = require('whiskers');
var url = require('url');
var RedisStore = require('connect-redis')(connect);

var port = process.env.PORT || 8127;
var redisUrl = process.env.REDISTOGO_URL && url.parse(process.env.REDISTOGO_URL);
var redisOptions;

if (redisUrl) {
  redisOptions = {
    host: redisUrl.hostname,
    port: redisUrl.port,
    pass: redisUrl.auth.split(':')[1]
  };
}

var templates = snout.sniff(__dirname+'/templates');

connect(
  connect.vhost('127.0.0.1|localhost|philly.sheltr.org|www.philly.sheltr.org', 
    connect(
      nowww(),
      connect.static(__dirname+'/static'),
      connect.logger(),
      connect.cookieParser(),
      connect.session({
        store: RedisStore(redisOptions), 
        secret: process.env.SECRET || 'walrus'
      }),
      connect.query(),
      // uncomment when we have users
      //authCheck, 
      renderer(),
      connect.router(function(app) {
        route(app);
      })
    )
  ),
  connect.vhost('sheltr.org|www.sheltr.org', 
    connect(
      phillyRedirect()
    )
  )
).listen(port);

console.log('Running on port '+port);

function route(app) {
  app.get('/', function(req, res) {
    res.render(templates.index);
  });
  app.get('/about', function(req, res) {
    res.render(templates.about);
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
          edit: true, // TODO move to req.user.edit
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
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?f=shelters_near&params={"center":['+req.query.lat+','+req.query.long+']}',
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

// from https://github.com/vincentwoo/connect-no-www
function nowww() {
  return function(req, res, next) {
    if (/^www\./.exec(req.headers.host)) {
      var host = req.headers.host.substring(req.headers.host.indexOf('.') + 1);
      var newUrl  = 'http://' + host + req.url;
      res.writeHead(301, {'Location': newUrl});
      return res.end();
    }
    next();
  };
};

// temporary redirect from sheltr.org to philly.sheltr.org
function phillyRedirect() {
  return function(req, res, next) {
    res.writeHead(301, {'Location': 'http://philly.sheltr.org'});
    return res.end();
  };
};

// easy rendering with whiskers
function renderer() {
  return function(req, res, next) {
    res.render = function(template, context) {
      context = connect.utils.merge({
        user: true, // to be populated by req.user,
        gaAccount: process.env.GA
      }, context);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(whiskers.render(template, context, templates.partials));
    };
    next();
  };
};

// from http://stackoverflow.com/questions/3498005/user-authentication-libraries-for-node-js
function authCheck(req, res, next) {
  var parsed = url.parse(req.url, true);

  // Logout
  if (parsed.pathname == "/logout") {
    req.session.destroy();
  }

  // Is User already validated?
  if (req.session && req.session.auth == true) {
    next(); // stop here and pass to the next onion ring of connect
    return;
  }

  // Auth - Replace this simple if with you Database or File or Whatever...
  // If Database, you need a Async callback...
  if (parsed.pathname == "/login" && 
      parsed.query.name == "max" && 
      parsed.query.pwd == "herewego") {
    req.session.auth = true;
    next();
    return;
  }

  // User is not authorized. Stop talking to him.
  if (parsed.pathname == "/admin") {
    res.writeHead(403);
    res.end('Sorry you are unauthorized.\n\nFor a login use: /login?name=max&pwd=herewego');
    return;
  }

  // Pass on
  next();
};
