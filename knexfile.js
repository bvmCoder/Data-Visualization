module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'millennium_db',
      user: 'root',
      password: 'root',
    },
    migrations: {
      directory: `${__dirname}/migrations/millennium_db`,
    },
    seeds: {
      directory: `${__dirname}/seeds/`,
    },
  },

  testing: {
    client: 'mysql',
    connection: {
      database: 'millennium_db_test',
      user: 'root',
      password: 'root',
    },
    migrations: {
      directory: `${__dirname}/migrations/millennium_db`,
    },
    seeds: {
      directory: `${__dirname}/seeds/`,
    },
  },

  production: {
    client: 'mysql',
    connection: {
      database: 'millennium_db',
      user: 'root',
      password: 'root',
    },
    migrations: {
      directory: `${__dirname}/migrations/millennium_db`,
    },
    seeds: {
      directory: `${__dirname}/seeds/`,
    },
  },

  large_db: {
    client: 'mysql',
    connection: {
      database: 'large_db',
      user: 'root',
      password: 'root',
    },
    migrations: {
      directory: `${__dirname}/migrations/large_db`,
    },
    seeds: {
      directory: `${__dirname}/seeds/`,
    },
  },
};
