const app = require('./app');
const config = require('nconf');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');

app.boot(function (err) {
  if (err) throw err;
  app.server = that.listen(config.get('express:port'), () => {
    log.info('Express web server started, listening on port', config.get('express:port'));
  });
});
