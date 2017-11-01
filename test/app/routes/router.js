const sinon = require('sinon');
const appRouter = require('../../../app/routes/router');
const app = require('../../../app');
const passport = require('passport');
const loginController = require('../../../app/controllers/login.controller');
const config = require('../../../config/config');
const graphController = require('../../../app/controllers/graph.controller');
const databaseController = require('../../../app/controllers/database.controller');

describe('router', () => {
  // Error and user values
  const ERROR = new Error('There was an error');
  const NO_ERROR = null;
  const USER = 'user';
  const NO_USER = '';

  // Stubbed methods
  let routerPost;
  let routerGet;
  let appUse;
  let authenticate;
  let getRelatedGraphData;

  // Parameters used in lambdas
  let err;
  let user;
  const req = {};
  const res = {
    redirect: () => {},
  };
  let resSpy;
  let next;

  describe('authentication', () => {
    // Fake method for router.get and router.post, to get the coverage to reach the lambda callbacks
    const authenticateCallback = (path, callbackA, callbackB) => {
      if (path === loginController.RELATIVE_URL_OPEN_ID) callbackA(req, res, next);
      if (path === loginController.RELATIVE_URL_PATH_OPEN_ID_RETURN) callbackB(req, res);
    };

    const stubs = {
      setup: () => {
        // Stub for passport.authenticate. Extends reach to lambda callbacks
        authenticate = sinon.stub(passport, 'authenticate').callsFake((path, callback) => {
          if (typeof callback === 'function') {
            callback(err, user);
          }
          return () => {};
        });
        /* Stub for app.use. In the instance where app.use is used in router.js, the router is
         * included as a parameter. So stubbing the app.use function allows for stubbing of the
         * router methods. */
        appUse = sinon.stub(app, 'use').callsFake((path, callback) => {
          routerPost = sinon.stub(callback, 'post').callsFake(authenticateCallback);
          routerGet = sinon.stub(callback, 'get').callsFake(authenticateCallback);
        });
      },
      teardown: () => {
        appUse.restore();
        routerPost.restore();
        routerGet.restore();
        authenticate.restore();
      },
    };

    describe('error handling', () => {
      beforeEach(() => {
        user = USER;
        next = sinon.spy(() => {});
        stubs.setup();
      });

      afterEach(stubs.teardown);

      context('if there is an error', () => {
        before(() => {
          err = ERROR;
        });

        it('should call next function with error as parameter', () => {
          appRouter(app, passport);
          sinon.assert.calledWith(next, err);
        });
      });

      context('if there is not an error', () => {
        before(() => {
          err = NO_ERROR;
        });

        it('should not call next function', () => {
          appRouter(app, passport);
          sinon.assert.neverCalledWith(next, err);
        });
      });
    });

    describe('redirection', () => {
      beforeEach(() => {
        err = NO_ERROR;
        resSpy = sinon.spy(res, 'redirect');
        next = () => {};
        stubs.setup();
      });

      afterEach(() => {
        resSpy.restore();
        stubs.teardown();
      });

      context('if there is no user', () => {
        before(() => {
          user = NO_USER;
        });

        it('should redirect to /', () => {
          appRouter(app, passport);
          sinon.assert.calledWith(resSpy, '/');
        });
      });

      context('if there is a user', () => {
        before(() => {
          user = USER;
        });

        it('should call res.redirect', () => {
          appRouter(app, passport);
          sinon.assert.called(resSpy);
        });

        it('should redirect to rootURL', () => {
          appRouter(app, passport);
          sinon.assert.calledWith(resSpy, config.rootURL);
        });

        it('should not redirect to /', () => {
          appRouter(app, passport);
          sinon.assert.neverCalledWith(resSpy, '/');
        });
      });
    });
  });

  describe('routes', () => {
    // Fake method for routerPost. Extends reach to lambda callbacks.
    const routesCallback = (path, callback) => {
      /* Callback activity for this test should be exclusive to routes, whose paths contain the
       * ':searchCriteria' substring */
      if (path.indexOf(':searchCriteria') === -1) return;
      callback(req, res);
    };

    beforeEach(() => {
      // Stub for app.use. Gets the router instance so it can be stubbed
      appUse = sinon.stub(app, 'use').callsFake((path, callback) => {
        routerGet = sinon.stub(callback, 'get').callsFake(routesCallback);
        routerPost = sinon.stub(callback, 'post').callsFake(() => {});
      });
      // Stub the getRelatedGraphData function, mainly to act as a spy
      getRelatedGraphData = sinon.stub(graphController, 'getRelatedGraphData')
                        .callsFake(() => {});
    });

    afterEach(() => {
      appUse.restore();
      routerGet.restore();
      routerPost.restore();
      getRelatedGraphData.restore();
    });

    describe('databases query', () => {
      it('should be properly defined', () => {
        appRouter(app, passport);
        sinon.assert.calledWith(routerGet, '/databases', databaseController.getListOfDatabases);
      });
    });
  });
});
