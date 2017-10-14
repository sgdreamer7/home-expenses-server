var log4js = require('log4js');
var log = log4js.getLogger('01_mongoose.js');
var config = require('nconf');

var mongoose = require('mongoose');
var requireTree = require('require-tree');

requireTree('../../models/');

module.exports = function () {

  mongoose.connection.on('open', function () {
    log.info('Connected to mongodb server.');
  });

  mongoose.Promise = Promise;
  mongoose.connect(config.get('mongoose:db'), { useMongoClient: true, });
  log.info('Started connection on ' + (config.get('mongoose:db')) + ', waiting for it to open...');

};
