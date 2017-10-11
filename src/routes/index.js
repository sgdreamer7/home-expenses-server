module.exports = function () {

  var config = require('nconf');
  var isProduction = config.get('NODE_ENV') === 'production';

  this.use('/api', require('./api'));

  this.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (!isProduction) {
    this.use(function (err, req, res, next) {
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

  this.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      'errors': {
        message: err.message,
        error: {}
      }
    });
  });

};
