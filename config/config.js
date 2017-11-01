
const path = require('path');

const rootPath = path.normalize(`${__dirname}/..`);

const mysqlServer = `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}`;

const config = {
  root: rootPath,
  app: {
    name: process.env.APP_NAME,
  },
  port: process.env.PORT,
  rootURL: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}`,
  server: mysqlServer,
  db: `${mysqlServer}/${process.env.DB_NAME}`,
  dbName: process.env.DB_NAME,
};

module.exports = config;
