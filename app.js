var express = require('express');
var RedisStore = require('connect-redis')(express);
var api = require('./routes/api');
var routes = require('./routes');
var url = require('url');
var whiskers = require('whiskers');

var port = process.env.PORT || process.argv[2] || 8127;
var redisUrl = process.env.REDISTOGO_URL && 
  url.parse(process.env.REDISTOGO_URL);
var redisOptions = redisUrl && {
  host: redisUrl.hostname,
  port: redisUrl.port,
  pass: redisUrl.auth.split(':')[1]
};

var app = express();
app.engine('.html', whiskers.__express);
app.set('views', __dirname + '/templates');

app.use(express.logger());
app.use(express.query());
app.use(express.cookieParser('walrus'));
app.use(express.session({
  store: new RedisStore(redisOptions), 
  secret: process.env.SECRET || 'walrus'
}));
app.use(app.router);
app.use(express.staticCache());
app.use(express.static(__dirname + '/static', {maxAge: 86400000}));

api(app);
routes(app);

app.listen(port);
console.log('Running on port '+port);
