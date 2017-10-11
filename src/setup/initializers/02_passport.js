var log4js = require('log4js');
var log = log4js.getLogger('02_passport.js');
var config = require('nconf');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function () {

  passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]'
  }, function (email, password, done) {
    User
      .findOne({ email: email })
      .then(function (user) {
        if (!user || !user.validPassword(password)) {
          return done(null, false, { errors: { 'email or password': 'is invalid' } });
        }
        return done(null, user);
      })
      .catch(done);
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });


  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      err
        ? done(err)
        : done(null, user);
    });
  });

};
