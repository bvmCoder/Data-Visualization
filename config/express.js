
const express = require('express');
const glob = require('glob');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const passport = require('passport');
const CernerStrategy = require('passport-cerner').CernerStrategy;
const session = require('express-session');
const returnURL = require('../app/controllers/login.controller').RELATIVE_URL_PATH_OPEN_ID_RETURN;
const Cache = require('../app/utility/Cache');

/**
 * A helper function to prepare and setup passport with Cerner Open Id Strategy
 * @param {Object} config The config object
 */
const setupPassport = (config) => {
  // Passport needs to be able to serialize users (storing user objects)
  // into and deserialize them out (return an identifier such as user id)
  // of the session in order to support persistent login sessions.
  passport.serializeUser((user, done) => {
    done(null, user.identifier);
  });

  passport.deserializeUser((identifier, done) => {
    done(null, { identifier: identifier });
  });

  // Prepare and create Cerner Open ID Strategy
  const STRATEGY_CONFIG = {
    //  The returnURL is the URL to which the user will be redirected after
    // authenticating with their OpenID provider.
    returnURL: config.rootURL + returnURL,

    // realm indicates the part of URL-space for which authentication is valid.
    realm: config.rootURL,

    // Treats each http request as an independent transaction
    stateless: true,
  };

  const cernerStrategy = new CernerStrategy(STRATEGY_CONFIG, (identifier, profile, done) => {
    process.nextTick(() => done(null, { identifier: identifier }));
  });

  passport.use(cernerStrategy);
};

module.exports = function init(app, config) {
  const env = process.env.NODE_ENV || 'development';
  /* eslint-disable no-param-reassign */
  app.locals.ENV = env;
  app.locals.dbCache = new Cache();
  // sets env, port, app.name, and db
  app.locals.ENV_DEVELOPMENT = env === 'development';
  app.locals.databaseInfo = {
    NAME: process.env.DB_NAME,
    USERNAME: process.env.DB_USERNAME,
  };
  /* eslint-enable no-param-reassign */

  app.set('views', `${config.root}/app/views`);
  app.set('view engine', 'ejs');

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(`${config.root}/public`));
  app.use(express.static(`${config.root}/node_modules/jquery/dist`));
  app.use(express.static(`${config.root}/node_modules/vis/dist`));
  app.use(methodOverride());

  // set the favicon
  app.use(favicon('public/img/favicon.ico'));
  // Use session to store core user and other session information.
  app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));

  // Setup passport with Cerner Strategy
  setupPassport(config);

  // Configure express app to use passport authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Grab all the controllers for the router
  const controllers = glob.sync(`${config.root}/app/controllers/*.js`);
  controllers.forEach((controller) => {
    require(controller); // eslint-disable-line global-require, import/no-dynamic-require
  });

  // Use router files established in the /app/routes directory
  // We also pass the same passport instance to be used with all routers
  const routes = glob.sync(`${config.root}/app/routes/*.js`);
  routes.forEach((route) => {
    require(route)(app, passport); // eslint-disable-line global-require, import/no-dynamic-require
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('pages/error', {
        message: err.message,
        error: err,
        title: 'error',
      });
    });
  }

  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: {},
      title: 'error',
    });
  });

  return app;
};
