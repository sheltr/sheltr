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

app.route('/[A-Z]{1,2}', function(req, res, matches) {
  var id = matches[1];
  res.writeHead(200, {'Content-Type': 'text/html'});
  console.log(process.env.CMAPI);
  https.get({
    host: 'api.cloudmine.me',
    port: 80,
    path: '/v1/app/60ecdcdd9fd6433297924f75c1c07b13/text',
    headers: {'X-CloudMine-ApiKey': process.env.CMAPI}
  }, function(cmres) {
    console.log(cmres.statusCode);
    cmres.on('data', function(chunk) {
      res.write(chunk);
    }).on('end', function() {
      //res.end(rend(temp.location));
      res.end();
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
