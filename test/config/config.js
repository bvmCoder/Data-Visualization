const expect = require('chai').expect;

const config = require('../../config/config');

describe('config', () => {
  it('should load', () => {
    expect(config).to.eql({
      root: config.root,
      app: {
        name: process.env.APP_NAME,
      },
      port: process.env.PORT,
      rootURL: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}`,
      server: `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}`,
      db: `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}/${process.env.DB_NAME}`,
      dbName: process.env.DB_NAME,
    });
  });
});
