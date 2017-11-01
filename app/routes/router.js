const config = require('./../../config/config');
const express = require('express');
const loginController = require('../controllers/login.controller');
const logoutController = require('../controllers/logout.controller');
const serverDBCacheController = require('../controllers/serverDBCache.controller');

const router = express.Router();

// Include every controller that is being used
const graphController = require('../controllers/graph.controller');
const databaseController = require('../controllers/database.controller');
const home = require('../controllers/home.js');

// Initialize the router middleware using already configured app and passport instances.
module.exports = function init(app, passport) {
  app.use('/', router);

  router.get('/', loginController.checkAuthentication, home.renderHome);

  // Route for logout
  router.get('/logout', logoutController.logout);

  const authenticateCernerUser = (req, res, next) => {
    passport.authenticate('cerner', (err, user) => {
      if (err) {
        next(err);
      }
      if (!user) {
        res.redirect('/');
      }
      res.redirect(config.rootURL);
    })(req, res, next);

    router.post(loginController.RELATIVE_URL_PATH_OPEN_ID_RETURN, passport.authenticate('cerner',
      { failureRedirect: '/' }), (request, response) => {
        response.redirect(config.rootURL);
      });
  };

  // Configure routes for authentication and trigger Cerner authentication in case not logged in
  router.post(loginController.RELATIVE_URL_OPEN_ID, authenticateCernerUser);
  router.get(loginController.RELATIVE_URL_OPEN_ID, authenticateCernerUser);

  // Returns a graph of all tables in the database
  router.get('/tables', graphController.getAllGraphData);

  // Deletes the server-side database cache
  router.delete('/serverDBCache', serverDBCacheController.deleteCacheData);

  // Updates the state with the list of databases in the server, and the current database
  router.get('/databases', databaseController.getListOfDatabases);
};
