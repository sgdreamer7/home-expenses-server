module.exports = function () {

  var config = require('nconf');

  this.use('/api', require('./api'));

  this.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  this.use(function (err, req, res, next) {
    const logFun = {
      'development': console.log,
      'test': function (err) { },
      'production': function (err) { }
    };
    logFun[process.env.NODE_ENV](err.stack);
    res.status(err.status);
    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });

};
