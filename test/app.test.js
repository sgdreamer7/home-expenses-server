const assert = require('assert');
const app = require('../src/app');
const mongoose = require('mongoose');
const config = require('nconf');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');
const username = 'vns';
const email = 'vns.scherbina@gmail.com';
const password = 'lifeisgood123';

describe('Home expenses server application tests', () => {
  before(function (done) {
    const that = this;
    app.boot(function (err) {
      if (err) throw err;
      app.server = app.listen(config.get('express:port'), () => {
        log.info('Express web server started, listening on port', config.get('express:port'));
        that.agent = require('../src/agent');
        done();
      });
    });
  });

  after(function (done) {
    app.server.close(() => {
      mongoose.connection.close();
      done();
    });
  });

  describe('User operations', () => {

    it('User login', function () {
      const that = this;
      return this.agent.Auth.login(email, password)
        .then(res => {
          that.token = res.user.token;
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
        });
    });

    it('Get current user', function () {
      this.agent.setToken(this.token);
      const that = this;
      return this.agent.Auth.current()
        .then(res => {
          that.user = res.user;
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
          assert.equal(res.user.token, that.token, 'token');
        });
    });

    it('Change user properties', function () {
      this.agent.setToken(this.token);
      const that = this;
      return this.agent.Auth.save(this.user)
        .then(res => {
          assert.equal(res.user.email, that.user.email, 'email');
          assert.equal(res.user.username, that.user.username, 'username');
          assert.equal(res.user.token, that.user.token, 'token');
        });
    });

  });

});
