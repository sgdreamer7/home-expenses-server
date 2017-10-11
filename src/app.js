const express = require('express');
const bootable = require('bootable');
const bootableEnv = require('bootable-environment');
const config = require('nconf');
const log4js = require('log4js');
const log = log4js.getLogger('app.js');
const app = bootable(express());

app.phase(bootable.initializers('src/setup/initializers/'));
app.phase(bootableEnv('src/setup/environments/', app));
app.phase(bootable.routes('src/routes/', app));

module.exports = app;
