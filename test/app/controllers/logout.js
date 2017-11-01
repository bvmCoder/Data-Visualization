/**
 * Created by TA053139 on 4/17/2017.
 */


const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const supertest = require('supertest');
const sinon = require('sinon');
const logoutController = require('../../../app/controllers/logout.controller');

const expect = chai.expect;


// Tell chai to use chaiHttp to call chai.request functions
chai.use(chaiHttp);

/**
* Run through the expected behavior for all http requests
*/
describe('logout', () => {
  context('when the logout url is called with http GET', () => {
    it('should return a status code of 302 (redirect)', () => {
      supertest(app)
        .get('/logout')
        .end((error, response) => {
          // Eslint consider the following line as an expression although it is a function call.
          // eslint-disable-next-line no-unused-expressions
          expect(error).to.be.null;
          expect(response).to.have.status(302);
        });
    });
    it('should set the redirect attribute of response to be true', () => {
      supertest(app)
        .get('/')
        .end((error, res) => {
          res.redirect.should.equal(true);
        });
    });
  });

  describe('#logout()', () => {
    context('when an http request calls logout', () => {
      it('should call the request.logout once', () => {
        const request = {
          url: '/logout',
        };

        request.logout = () => { };
        const logoutSpy = sinon.spy(request, 'logout');

        const response = {
          // arg parameter is not used but it kept for clarity.
          // eslint-disable-next-line no-unused-vars
          redirect: function redirect(arg) { },
        };
        logoutController.logout(request, response);
        sinon.assert.calledOnce(logoutSpy);
      });
      it('should redirect to home page', () => {
        const request = {
          url: '/logout',
        };

        request.logout = function logout() { };

        const response = {
          // arg parameter is not used but it kept for clarity.
          // eslint-disable-next-line no-unused-vars
          redirect: function redirect(arg) { },
        };
        const redirectSpy = sinon.spy(response, 'redirect');
        logoutController.logout(request, response);
        sinon.assert.calledWith(redirectSpy, '/');
      });
    });
  });
});
