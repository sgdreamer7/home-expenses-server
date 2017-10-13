const express = require('express');
const bootable = require('bootable');
const bootableEnv = require('bootable-environment');
const config = require('nconf');
const mongoose = require('mongoose');
const log4js = require('log4js');
const log = log4js.getLogger('app.js');
const app = bootable(express());

app.phase(bootable.initializers('src/setup/initializers/'));
app.phase(bootableEnv('src/setup/environments/', app));
app.phase(bootable.routes('src/routes/', app));

app.start = function (done) {
  this.boot(err => {
    if (err) throw err;
    this.server = this.listen(config.get('express:port'), () => {
      log.info('Express web server started, listening on port', config.get('express:port'));
      done();
    });
  });
};

app.shutdown = function (done) {
  this.server.close(function () {
    mongoose.connection.close();
    done();
  });
};

module.exports = app;
