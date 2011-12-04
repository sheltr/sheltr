var https = require('https');
var paperboy = require('paperboy');
var querystring = require('querystring');
var snout = require('snout');
var url = require('url');
var util = require('util');
var whiskers = require('whiskers');

var app = snout.app({
  dir: __dirname,
  watch: true
});

var temp = app.templates;

// shortcut to populate "partials" with all templates
var rend = function(template, context) {
  context = context || {};
  return whiskers.render(template, context, temp);
};

app.page404 = rend(temp['404']);

app.route('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(rend(temp.index));
});

app.route('/about', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(rend(temp.about));
});

app.route('/([A-Z]{1,2})', function(req, res, matches) {
  var id = matches[1];
  res.writeHead(200, {'Content-Type': 'text/html'});
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
      if (!parsed.success) {
        return app.NotFound(res);
      }
      var loc = parsed.success[id];
      loc.raw = JSON.stringify(loc);
      res.end(rend(temp.location, {loc: loc}));
    });
  }).on('error', function(e) {
    console.log(e);
    res.end(rend(temp.location));
  });
});

app.route('/static/.*', function(req, res) {
  paperboy.deliver(__dirname, req, res);
});

// temporarily look for missing in templates
app.route('/.*', function(req, res) {
  paperboy.deliver(__dirname+'/templates', req, res);
});


// exports

module.exports = app;
