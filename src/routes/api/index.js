var router = require('express').Router();

router.use('/', require('./users'));
router.use('/categories', require('./categories'));

router.use(function (err, req, res, next) {
  const logFun = {
    'development': console.log,
    'test': function (err) { },
    'production': function (err) { }
  };
  logFun[process.env.NODE_ENV](err);
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
