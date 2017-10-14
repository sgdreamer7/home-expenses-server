var log4js = require('log4js');
var log = log4js.getLogger('routes/api/index.js');
var config = require('nconf');

var secret = config.get('express:secret');
var jwt = require('express-jwt');
var tokensCache = {};
var blacklist = require('express-jwt-blacklist');

blacklist.configure({
  tokenId: 'id',
  store: {
    set: function (key, value, lifetime, fn) {
      fn(null, tokensCache[key] = value);
      if (lifetime) setTimeout(tokenExpire.bind(null, key), lifetime * 1000);
    },
    get: function (key, fn) {
      fn(null, tokensCache[key]);
    }
  }
});

function getTokenFromHeader(req) {
  if (['Token', 'Bearer'].includes(req.headers.authorization && req.headers.authorization.split(' ')[0])) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
    isRevoked: blacklist.isRevoked
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader,
    isRevoked: blacklist.isRevoked
  }),
  logout: function (user) {
    blacklist.revoke(user);
  }
};

function tokenExpire(key) {
  delete tokensCache[key];
}
module.exports = auth;
