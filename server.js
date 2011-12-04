var connect = require('connect');
var https = require('https');
var snout = require('snout');
var whiskers = require('whiskers');
var RedisStore = require('connect-redis')(connect);

var port = process.env.PORT || 8127;

var templates = snout.sniff(__dirname+'/templates');

connect(
  connect.vhost('127.0.0.1|localhost|philly.sheltr.org', 
    connect(
      connect.cookieParser(),
      connect.session({
        store: new RedisStore, 
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
        if (!parsed.success[id]) {
          return next();
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        var loc = parsed.success[id];
        loc.raw = JSON.stringify(loc);
        res.end(render(templates.location, {loc: loc}));
      });
    }).on('error', function(e) {
      console.log(e);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(render(templates.location));
    });
  });
};
