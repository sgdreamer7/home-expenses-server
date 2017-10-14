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

  mongoose.connection.on('error', function (err) {
    log.error('Could not connect to mongodb server!');
    log.error(err.message);
  });

  try {
    mongoose.Promise = Promise;
    mongoose.connect(config.get('mongoose:db'), { useMongoClient: true, });
    log.info('Started connection on ' + (config.get('mongoose:db')) + ', waiting for it to open...');
  } catch (err) {
    log.error('Failed to connect to ' + (config.get('mongoose:db')), err.message);
    throw new Error('mongoose: Failed to connect to ' + (config.get('mongoose:db')) + ': ' + err.message);
  }

};
