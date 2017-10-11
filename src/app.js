var express = require('express');

var bootable = require('bootable');
var bootableEnv = require('bootable-environment');
var config = require('nconf');

var log4js = require('log4js');
var log = log4js.getLogger('app.js');

var app = bootable(express());


app.phase(bootable.initializers('src/setup/initializers/'));
app.phase(bootableEnv('src/setup/environments/', app));
app.phase(bootable.routes('src/routes/', app));

module.exports = app;
