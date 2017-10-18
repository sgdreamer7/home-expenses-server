var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

// Get current user
router.get('/user', auth.required, (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if (!user) return res.sendStatus(401);
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

// Update user properties
router.put('/user', auth.required, (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if (!user) return res.sendStatus(401);
      if (typeof req.body.user.username !== 'undefined') user.username = req.body.user.username;
      if (typeof req.body.user.email !== 'undefined') user.email = req.body.user.email;
      if (typeof req.body.user.password !== 'undefined') user.setPassword(req.body.user.password);
      return user.save();
    })
    .then((user) => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

// Logout current user
router.get('/user/logout', auth.required, (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if (!user) return res.sendStatus(401);
      auth.logout(req.payload);
      return res.json({ user: { username: req.payload.username } });
    })
    .catch(next);
});

// Login user
router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) return res.status(422).json({ errors: { email: "can't be blank" } });
  if (!req.body.user.password) return res.status(422).json({ errors: { password: "can't be blank" } });
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
    return res.status(422).json(info);
  })(req, res, next);
});

// Register user
router.post('/users', auth.optional, (req, res, next) => {
  var user = new User();
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  user
    .save()
    .then(() => { return res.json({ user: user.toAuthJSON() }); })
    .catch(next);
});

// Delete user
router.delete('/user', auth.required, (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if (!user) return res.sendStatus(401);
      auth.logout(req.payload);
      return user.remove();
    })
    .then(() => {

      return res.sendStatus(204);
    })
    .catch(next);
});

module.exports = router;
