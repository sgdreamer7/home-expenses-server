var express = require('express');

var bootable = require('bootable');
var bootableEnv = require('bootable-environment');
var config = require('nconf');

var log4js = require('log4js');
var log = log4js.getLogger('app.js');

var app = bootable(express());


app.phase(bootable.initializers('setup/initializers/'));
app.phase(bootableEnv('setup/environments/', app));


app.boot(function (err) {

  if (err) {
    throw err
  };

  var isProduction = config.get('NODE_ENV') === 'production';

  app.use(require('./routes'));

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  console.log('Is production: '+(isProduction));
  if (!isProduction) {
    app.use(function (err, req, res, next) {
      console.log(err.stack);

      res.status(err.status || 500);

      res.json({
        'errors': {
          message: err.message,
          error: err
        }
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      'errors': {
        message: err.message,
        error: {}
      }
    });
  });

  app.listen(config.get('express:port'), function () {
    log.info('Express web server started, listening on port', config.get('express:port'));
  });

});
