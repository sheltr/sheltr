var app = require('./app');
//var connect = require('connect');
var http = require('http');

var port = process.env.PORT || 8127;

http.createServer(function(req, res) {
  app.respond(req, res);
}).listen(port);

console.log('Running on port '+port);
