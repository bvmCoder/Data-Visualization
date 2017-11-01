const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

chai.use(chaiHttp);

const serverDBCacheController =
  require('../../../app/controllers/serverDBCache.controller');

describe('deleteCacheData', () => {
  let res;
  let req;
  let status;
  let sendSpy;

  beforeEach(() => {
    status = sinon.stub();
    sendSpy = sinon.spy();
    res = {};
    res.status = status;
    req = {
      app: {
        locals: {
          dbCache: {
            flushAll: null,
          },
        },
      },
    };
  });

  context('When dbCache is flushed successfully', () => {
    let flushAllSpy;
    beforeEach(() => {
      flushAllSpy = sinon.spy();
      req.app.locals.dbCache.flushAll = flushAllSpy;
      status.withArgs(200).returns({ send: sendSpy });
      serverDBCacheController.deleteCacheData(req, res);
    });
    it('should return with a status of 200 and call the cache method to clear the cache contents', () => {
      sinon.assert.calledOnce(flushAllSpy);
      sinon.assert.calledOnce(sendSpy);
    });
  });

  context('When an error occurs flushing the dbCache', () => {
    beforeEach(() => {
      req.app.locals.dbCache.flushAll = () => {
        const newError = new Error('TESTING_ERROR');
        throw newError;
      };
      status.withArgs(500).returns({ send: sendSpy });
      serverDBCacheController.deleteCacheData(req, res);
    });
    it('should respond once with a status of 500', () => {
      sinon.assert.calledOnce(sendSpy);
    });
    it('should respond with a user friendly assert message', () => {
      sinon.assert.calledWithMatch(sendSpy, {
        message: 'Something went wrong clearing the server database cache.',
      });
    });
  });
});
