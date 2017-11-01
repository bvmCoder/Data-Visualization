/**
 * Created by TA053139 on 4/13/2017.
 */


// A constant stores the relative url of Cerner authentication request
module.exports.RELATIVE_URL_OPEN_ID = '/auth/openid';

// A constant stores the relative url of Cerner authentication request return
module.exports.RELATIVE_URL_PATH_OPEN_ID_RETURN = '/auth/openid/return';


/**
 * A function that is going to be executed once http request is authenticated.
 * @callback nextFunction
 * @param {Error} err The error object if any
 */


/** Check if the target http request is authenticated with cerner session.
 * otherwise, redirect to the login page.
 * @param {Object} request - The HTTP request object
 * @param {Object} response - The HTTP response object
 * @param {nextFunction} next - The function that is next in the execution stack such as
 *  a function to render a page
 */
module.exports.checkAuthentication = function checkAuthentication(request, response, next) {
  if (request.isAuthenticated()) {
    next();
  } else {
    response.redirect(module.exports.RELATIVE_URL_OPEN_ID);
  }
};


/**
 * Returns the Cerner user id from the http request object
 * @param {Object} request the HTTP request
 */
module.exports.getUserId = function getUserId(request) {
  // The cerner id retrieved from the request is in the form of
  // https://associates.cerner.com/accounts/person/<CERNER ID>
  // In order to extract the actual id we apply a regular expression that
  // simply will search for the last match of non-forward slash letter.
  const results = request.user.identifier.match(/[^/]+$/);
  if (results) {
    return results[0].toUpperCase();
  }
  throw new Error('Cerner ID is not retrievable');
};
