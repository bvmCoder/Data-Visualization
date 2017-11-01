/**
 * Created by TA053139 on 4/17/2017.
 */


const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const supertest = require('supertest');
const sinon = require('sinon');
const loginController = require('../../../app/controllers/login.controller');


const expect = chai.expect;


// Tell chai to use chaiHttp to call chai.request functions
chai.use(chaiHttp);

/**
* Run through the expected behavior for all http requests
*/
describe('login', () => {
  context('when not-authorized request is called the root url', () => {
    it('should return a status code of 302 (redirect)', () => {
      supertest(app)
        .get('/')
        .end((err, res) => {
          res.status.should.equal(302);
        });
    });
    it('should set the redirect attribute of response to be true', () => {
      supertest(app)
        .get('/')
        .end((err, res) => {
          res.redirect.should.equal(true);
        });
    });
    it('should set the redirect uri to Cerner authentication', () => {
      supertest(app)
        .get('/')
        .end((err, res) => {
          res.request.uri.should.equal(loginController.RELATIVE_URL_OPEN_ID);
        });
    });
  });

  describe('#checkAuthentication', () => {
    context('when an authorized request is called the root url', () => {
      it('should call the nextFunction callback once', () => {
        const nextFunction = sinon.spy();
        const request = {
          url: '/',
        };
        request.isAuthenticated = () => true;

        const response = {
          // arg parameter is not used but it kept for clarity.
          // eslint-disable-next-line no-unused-vars
          redirect: function redirect(arg) { },
        };
        loginController.checkAuthentication(request, response, nextFunction);
        sinon.assert.calledOnce(nextFunction);
      });
    });

    context('when a non-authorized request is called the root url', () => {
      it('should redirect the url to the open id url', () => {
        const nextFunction = sinon.spy();

        const request = {
          url: '/',
        };
        request.isAuthenticated = () => false;

        const response = {
          // str parameter is not used but it kept for clarity.
          // eslint-disable-next-line no-unused-vars
          redirect: function redirect(arg) { },
        };
        const redirectSpy = sinon.spy(response, 'redirect');
        loginController.checkAuthentication(request, response, nextFunction);
        sinon.assert.calledWith(redirectSpy, loginController.RELATIVE_URL_OPEN_ID);
      });
    });
  });
  describe('#getUserId', () => {
    context('when an authorized request is passed', () => {
      it('should return the corresponding cerner id', () => {
        const request = {
          user: { identifier: 'https://associates.cerner.com/accounts/person/Ab012345' },
        };
        // Expected ID that is upper cased.
        const expectedID = 'AB012345';
        const returnedValue = loginController.getUserId(request);
        expect(returnedValue).to.equals(expectedID);
      });
    });
    context('when an authorized request is passed with invalid retrieved Cerner ID', () => {
      it('should throw an error', () => {
        const request = {
          user: { identifier: '' },
        };
        expect(() => loginController.getUserId(request)).to.throw(Error, 'Cerner ID is not retrievable');
      });
    });
  });
});
