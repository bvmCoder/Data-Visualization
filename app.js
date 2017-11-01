
const express = require('express');
const config = require('./config/config');

const app = express();

module.exports = require('./config/express')(app, config);

if (!module.parent) {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Express server listening on port ${config.port}`);
  });
}
