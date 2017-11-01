const queryService = require('../../../app/services/query.service');
const Cache = require('../../../app/utility/Cache');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;
const Connection = require('mysql/lib/Connection');
const mysql = require('mysql');
const chai = require('chai');
const sinon = require('sinon');
chai.use(require('chai-as-promised'));

const expect = chai.expect;
chai.should();

describe('query.service', () => {
  let cache;
  let createConnection;
  let connection;
  let query;
  let end;
  let cacheGet;
  let cacheSet;
  const sqlQuery = 'QUERY';
  const expectedResults = 'RESULTS';

  beforeEach(() => {
    cache = new Cache();
    cacheGet = sinon.stub(cache, 'get');
    cacheSet = sinon.stub(cache, 'set');

    connection = sinon.createStubInstance(Connection);
    createConnection = sinon.stub(mysql, 'createConnection').returns(connection);

    // query and end are already stubbed for the connection - get their stubs
    query = connection.query;
    end = connection.end;
  });

  afterEach(() => {
    cacheGet.restore();
    cacheSet.restore();

    createConnection.restore();
  });

  describe('#runQuery', () => {
    context('when not given an SQL query', () => {
      context('and not given a cache object', () => {
        it('should be rejected with the appropriate error', () =>
          queryService.runQuery(undefined, undefined)
                      .should.be.rejectedWith(Error,
                                              ErrorMessages.INVALID_OR_MISSING_QUERY_ARGUMENT));
      });

      context('and given a cache object', () => {
        it('should be rejected with the appropriate error', () =>
          queryService.runQuery(undefined, cache)
                      .should.be.rejectedWith(Error,
                                              ErrorMessages.INVALID_OR_MISSING_QUERY_ARGUMENT));
      });
    });

    context('when given an SQL query', () => {
      context('and not given a cache object', () => {
        it('should be rejected with the appropriate error', () =>
          queryService.runQuery(sqlQuery, undefined)
                      .should.be.rejectedWith(Error,
                                              ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT));
      });

      context('and given a cache object', () => {
        context('if the query has been cached', () => {
          beforeEach(() => {
            /* Stub cache.get to call the second argument provided to the method, which is the
             * success callback that is run if a match is found in the cache. Provides the expected
             * results to the callback as a parameter. */
            cacheGet.callsArgWith(1, expectedResults);
          });

          it('should not create a connection', () =>
            queryService.runQuery(sqlQuery, cache)
                      .should.be.fulfilled.then(() => {
                        sinon.assert.notCalled(createConnection);
                      }));

          it('should not query the database', () =>
            queryService.runQuery(sqlQuery, cache)
                      .should.be.fulfilled.then(() => {
                        sinon.assert.notCalled(query);
                      }));

          it('should not end the connection', () =>
            queryService.runQuery(sqlQuery, cache)
                      .should.be.fulfilled.then(() => {
                        sinon.assert.notCalled(end);
                      }));

          it('should return the query results', () =>
            queryService.runQuery(sqlQuery, cache)
                        .should.be.fulfilled.then((results) => {
                          expect(results).to.eql(expectedResults);
                        }));

          it('should not set the cache', () =>
            queryService.runQuery(sqlQuery, cache)
                        .should.be.fulfilled.then(() => {
                          sinon.assert.notCalled(cacheSet);
                        }));
        });

        context('if the query has not been cached', () => {
          beforeEach(() => {
            /* Stub cache.get to call the third argument of the method, which is the failure
             * callback that is run if a match is not found in the cache. */
            cacheGet.callsArg(2);
          });

          context('and there is an error with the query', () => {
            const queryErrorMessage = 'Error with the query';

            beforeEach(() => {
              /* Stub connection.query to call the first callback it finds, providing an error
               * as a parameter */
              query.yields(new Error(queryErrorMessage));
            });

            it('should create a connection', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.rejected.then(() => {
                            sinon.assert.calledOnce(createConnection);
                          }));

            it('should query the database', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.rejected.then(() => {
                            sinon.assert.calledOnce(query);
                            expect(query.args[0][0]).to.eql(sqlQuery);
                          }));

            it('should end the connection', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.rejected.then(() => {
                            sinon.assert.calledOnce(end);
                          }));

            it('should reject the promise with the error', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.rejectedWith(Error, queryErrorMessage));

            it('should not set the cache', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.rejected.then(() => {
                            sinon.assert.notCalled(cacheSet);
                          }));
          });

          context('and there is not an error with the query', () => {
            beforeEach(() => {
              /* Stub connection.query to call the first callback it finds, with a null error and
               * the expected results as parameters. */
              query.yields(null, expectedResults);
            });

            it('should create a connection', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.fulfilled.then(() => {
                            sinon.assert.calledOnce(createConnection);
                          }));

            it('should query the database', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.fulfilled.then(() => {
                            sinon.assert.calledOnce(query);
                            expect(query.args[0][0]).to.eql(sqlQuery);
                          }));

            it('should end the connection', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.fulfilled.then(() => {
                            sinon.assert.calledOnce(end);
                          }));

            it('should set the cache', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.fulfilled.then(() => {
                            sinon.assert.calledOnce(cacheSet);
                          }));

            it('should return the query results', () =>
              queryService.runQuery(sqlQuery, cache)
                          .should.be.fulfilled.then((results) => {
                            expect(results).to.eql(expectedResults);
                          }));
          });
        });
      });
    });
  });
});
