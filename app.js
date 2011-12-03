var http = require('http');
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

app.route('/location', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(rend(temp.location));
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
