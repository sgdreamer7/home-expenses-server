var http = require('http'),
  path = require('path'),
  methods = require('methods'),
  methodOverride = require('method-override'),
  express = require('express'),
  expressLogger = require('../../middlewares/express-logger'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  favicon = require('serve-favicon'),
  session = require('express-session'),
  cors = require('cors'),
  passport = require('passport'),
  errorhandler = require('errorhandler'),
  routes = express.Router(),
  config = require('nconf');

module.exports = function () {
  this.use(cors());
  this.use(require('morgan')('dev'));
  this.use(bodyParser.urlencoded({ extended: false }));
  this.use(bodyParser.json());
  this.use(methodOverride());
  this.use(express.static(require('path').resolve('public')));
  this.use(expressLogger);
  this.use(cookieParser());
  this.use(session({ secret: config.get('express:secret'), cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
  this.use(passport.initialize());
  this.use(passport.session());
};
