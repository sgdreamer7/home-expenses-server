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
  return next(err);
});

module.exports = router;
