/**
 * Created by JG052150 on 3/27/2017.
 * Performs all tests on the home controller
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const loginController = require('../../../app/controllers/login.controller');
const homeController = require('../../../app/controllers/home');
const sinon = require('sinon');


// Tell chai to use chaiHttp to call chai.request functions
chai.use(chaiHttp);

/**
* Run through the expected behavior for all http requests
*/
describe('Home Controller', () => {
  const databaseTestName = 'HOME_CONTROLLER_TEST_DB_NAME';
  const databaseTestUsername = 'HOME_CONTROLLER_TEST_DB_USERNAME';
  const testApp = {
    locals: {
      databaseInfo: {
        NAME: databaseTestName,
        USERNAME: databaseTestUsername,
      },
    },
  };

  const testRequest = {
    user: { identifier: 'TEST_USER' },
    app: testApp,
  };
  const testResponse = {
    // str parameter is not used but it kept for clarity.
    // eslint-disable-next-line no-unused-vars
    render: function render(str) { },
  };

  let loginControllerStub;
  let renderSpy;

  beforeEach(() => {
    loginControllerStub = sinon.stub(loginController, 'getUserId');
    renderSpy = sinon.spy(testResponse, 'render');
  });

  afterEach(() => {
    loginControllerStub.restore();
    testResponse.render.restore();
  });

  context('when an authorized request is passed with invalid retrieved Cerner ID', () => {
    it('should render the error page', () => {
      loginControllerStub.throwsException();
      homeController.renderHome(testRequest, testResponse);
      sinon.assert.calledWith(renderSpy, 'pages/error');
    });
  });

  context('when an authorized request is passed and a userID is retrieved', () => {
    it('should render the index page', () => {
      const testUserID = 'HOME_CONTROLLER_TEST_USER_ID';
      loginControllerStub.returns(testUserID);
      homeController.renderHome(testRequest, testResponse);
      sinon.assert.calledWith(renderSpy, 'pages/index', {
        title: 'Millennium Data Model Visualizer',
        database_name: databaseTestName,
        database_username: databaseTestUsername,
        user: testUserID,
      });
    });
  });
});
