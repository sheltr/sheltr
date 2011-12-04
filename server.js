var connect = require('connect');
var https = require('https');
var snout = require('snout');
var whiskers = require('whiskers');
var url = require('url');
var RedisStore = require('connect-redis')(connect);

var port = process.env.PORT || 8127;
var redisUrl = process.env.REDISTOGO_URL && url.parse(process.env.REDISTOGO_URL);
var redisStore;

if (redisUrl) {
  redisStore = new RedisStore({
    host: redisUrl.host,
    port: redisUrl.port,
    pass: redisURL.auth.split(':')[1]
  });
} else {
  redisStore = new RedisStore;
}

var templates = snout.sniff(__dirname+'/templates');

connect(
  connect.vhost('127.0.0.1|localhost|philly.sheltr.org', 
    connect(
      connect.cookieParser(),
      connect.session({
        store: redisStore, 
        secret: process.env.SECRET || 'walrus'
      }),
      connect.logger(),
      connect.router(function(app) {
        route(app);
      }),
      connect.static(__dirname+'/static')
    )
  ),
  connect.vhost('sheltr.org', 
    connect(
      connect.logger(),
      connect.router(function(app) {
        app.get('/', function(req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(render(templates.aboutSheltr));
        });
      })
    )
  )
).listen(port);

console.log('Running on port '+port);

// shortcut to populate partials with templates.partials
function render(template, context) {
  context = context || {};
  return whiskers.render(template, context, templates.partials);
};

function route(app) {
  app.get('/', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(render(templates.index));
  });
  app.get('/about', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(render(templates.about));
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
      path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text?f=shelters_near&apikey=1d0c51df5b5947059c018e9305e3fa69&result_only=true&params={"center": ['+req.query.lat+', '+req.query.long+']',
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
