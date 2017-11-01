/**
 * Created by TA053139 on 4/20/2017.
 */


/**
 * A function to logout a user.
 * @param {Object} request - The HTTP request object
 * @param {Object} response - The HTTP response object
 */
module.exports.logout = function logout(request, response) {
  // Remove the req.user property and clear the login session (if any).
  request.logout();

  // Redirect the page so it will trigger authentication request.
  response.redirect('/');
};
