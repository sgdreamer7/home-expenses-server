const app = require('./app');
const config = require('nconf');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');

app.start(() => { });
