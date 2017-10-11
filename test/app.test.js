const assert = require('assert');
const app = require('../src/app');
const config = require('nconf');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');

describe('Home expenses server application tests', () => {
  before(function (done) {
    var that = this
    app.boot(function (err) {
      if (err) throw err;
      that.agent = require('../src/agent');
      that.server = app.listen(config.get('express:port'), () => {
        log.info('Express web server started, listening on port', config.get('express:port'));
        done();
      });
    });
  });

  after(function (done) {
    this.server.close(() => {
      done();
      process.exit();
    });
  });

  it('User login', function () {
    const username = 'vns';
    const email = 'vns.scherbina@gmail.com';
    const password = 'lifeisgood123';
    this.agent.Auth.login(email, password)
      .then(res => {
        assert.equal(res.user.email, email);
        assert.equal(res.user.username, username);
      })
      .catch(err => {
        console.log(err)
      });

  });

});
