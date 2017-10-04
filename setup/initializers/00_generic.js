var config = require('nconf');
var log4js = require('log4js');
var log = log4js.getLogger('00_generic.js');

module.exports = function () {

  config.env();
  config.file({ 'file': require('path').resolve('config.json') });

};
