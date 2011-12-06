var connect = require('connect');
var https = require('https');
var routes = require('./routes');
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
      routes.renderer(),
      connect.router(function(app) {
        routes.route(app);
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
