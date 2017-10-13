const assert = require('assert');
const app = require('../src/app');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');

const username = 'username';
const email = 'username@nowhere.com';
const password = 'userpassword';

describe('Home expenses server application tests', () => {
  before(function (done) {
    app.start(() => {
      this.agent = require('../src/agent');
      done();
    });
  });

  after(function (done) {
    app.shutdown(done);
  });

  describe('User operations', () => {

    it('Register user', function () {
      return this.agent.Auth.register(username, email, password)
        .then(res => {
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
        });
    });

    it('Login user', function () {
      return this.agent.Auth.login(email, password)
        .then(res => {
          this.token = res.user.token;
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
        });
    });

    it('Get current user', function () {
      this.agent.setToken(this.token);
      return this.agent.Auth.current()
        .then(res => {
          this.user = res.user;
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
          assert.equal(res.user.token, this.token, 'token');
        });
    });

    it('Change user properties', function () {
      this.agent.setToken(this.token);
      return this.agent.Auth.save(this.user)
        .then(res => {
          assert.equal(res.user.email, this.user.email, 'email');
          assert.equal(res.user.username, this.user.username, 'username');
          assert.equal(res.user.token, this.user.token, 'token');
        });
    });

    it('Delete user', function () {
      return this.agent.Auth.delete(this.user)
        .then(res => {
          assert.equal(res.toString(), ({}).toString(), 'No response for user removal');
        });
    });

  });

});
