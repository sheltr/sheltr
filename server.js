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
  connect.vhost('127.0.0.1|localhost|philly.sheltr.org', 
    connect(
      nowww,
      connect.logger(),
      connect.cookieParser(),
      connect.session({
        store: RedisStore(redisOptions), 
        secret: process.env.SECRET || 'walrus'
      }),
      connect.query(),
      authCheck,
      connect.router(function(app) {
        route(app);
      }),
      connect.static(__dirname+'/static')
    )
  ),
  connect.vhost('sheltr.org', 
    connect(
      nowww,
      connect.logger(),
      connect.router(function(app) {
        app.get('/', function(req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(render(templates.aboutSheltr));
        });
      }),
      connect.static(__dirname+'/static')
    )
  )
).listen(port);

console.log('Running on port '+port);

function route(app) {
  app.get('/', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(render(templates.index));
  });
  app.get('/about', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(render(templates.about));
  });
  app.get('/admin', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(render(templates.admin));
  });
  app.get('/l/:id', function(req, res, next) {
    var id = req.params.id;
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?keys='+id,
      headers: {'X-CloudMine-ApiKey': process.env.CMAPI}
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
        res.writeHead(200, {'Content-Type': 'text/html'});
        loc.raw = JSON.stringify(loc);
        res.end(render(templates.location, {loc: loc}));
      });
    }).on('error', function(e) {
      console.log(e);
      next();
    });
  });
  app.get('/_map', function(req, res, next) {
    https.get({
      host: 'api.cloudmine.me',
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?f=shelters_near&result_only=true&params={"center":['+req.query.lat+','+req.query.long+']}',
      headers: {'X-CloudMine-ApiKey': process.env.CMAPI}
    }, function(cmres) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      cmres.on('data', function(chunk) {
        res.write(chunk);
      }).on('end', function() {
        res.end();
      });
    }).on('error', function(e) {
      console.log(e);
      next();
    });
  });
};

// from https://github.com/vincentwoo/connect-no-www
function nowww(req, res, next) {
  if (/^www\./.exec(req.headers.host)) {
    var host = req.headers.host.substring(req.headers.host.indexOf('.') + 1);
    var newUrl  = 'http://' + host + req.url;
    res.writeHead(301, {'Location': newUrl});
    return res.end();
  }
  next();
};

// shortcut to populate partials with templates.partials
function render(template, context) {
  context = context || {};
  return whiskers.render(template, context, templates.partials);
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

