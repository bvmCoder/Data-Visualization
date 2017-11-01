/**
 * Handles the logic used to render the home page
 */

const loginController = require('../controllers/login.controller');

module.exports.renderHome = function renderHomePage(req, res) {
  try {
    const userID = loginController.getUserId(req);
    res.render('pages/index', {
      title: 'Millennium Data Model Visualizer',
      database_name: req.app.locals.databaseInfo.NAME,
      database_username: req.app.locals.databaseInfo.USERNAME,
      user: userID,
    });
  } catch (error) {
    res.render('pages/error',
      {
        message: 'Cerner ID is not retrievable or Cerner ID pattern has been changed',
        error: error,
      });
  }
};
