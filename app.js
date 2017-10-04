var express = require('express');

var bootable = require('bootable');
var bootableEnv = require('bootable-environment');
var config = require('nconf');

var log4js = require('log4js');
var log = log4js.getLogger('app.js');

var app = bootable(express());


app.phase(bootable.initializers('setup/initializers/'));
app.phase(bootableEnv('setup/environments/', app));
app.phase(bootable.routes('routes/', app));

app.boot(function (err) {

  if (err) {
    throw err
  };

  app.listen(config.get('express:port'), function () {
    log.info('Express web server started, listening on port', config.get('express:port'));
  });

});
