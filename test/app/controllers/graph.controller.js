const sinon = require('sinon');
const expect = require('chai').expect;
const Graph = require('../../../app/utility/Graph');
const metadataController = require('../../../app/controllers/metadata.controller');
const graphController = require('../../../app/controllers/graph.controller');
/**
 * @function errorWithCode - Creates an error with a code string.
 * @param {String} code - Text of the error code.
 * @param {String} [message='DEFAULT_ERROR_MESSAGE'] - Text of the error message.
 * @returns {Error} newError - The error with the code and message.
 */
const errorWithCode = (code, message = 'DEFAULT_ERROR_MESSAGE') => {
  const newError = new Error(message);
  newError.code = code;
  return newError;
};

describe('graph.controller', () => {
  describe('#getAllGraphData', () => {
    /* Ultimately we don't really care what the request is, since
    we're going to be forcing the server to respond with data */
    const request = {};
    let response;
    let metadataControllerStub;

    beforeEach(() => {
      metadataControllerStub = sinon.stub(metadataController,
        'getAllTableMetadata');

      /* What we'll be testing here is the response sent from the server.
      Our tests are not going to be testing the promise within the
      graphController, but rather the response sent.
      That's why we're testing against this 'response' object, rather than
      against the graphController.getGraphData(...) promise itself. */
      response = {
        app: { locals: { dbCache: {} } },
        sendVal: null,
        statusVal: null,
        send: function send(sentObject) {
          this.sendVal = sentObject;
        },
        status: function status(setStatus) {
          this.statusVal = setStatus;
          // Returning 'this' allows our fake .status() to be composed,
          // e.g: res.status(200).send(...)
          return this;
        },
      };
    });

    afterEach(() => {
      metadataControllerStub.restore();
    });

    context('when getAllTableMetadata has an internal error', () => {
      it('should respond with an error', () => {
        metadataControllerStub.returns(Promise.reject(new Error()));

        return graphController.getAllGraphData(request, response)
          .then(() => {
            expect(response.statusVal).to.equal(500);
            expect(response.sendVal).to.have.property('message');
          });
      });
    });

    context('when getAllTableMetadata has an internal error because it cannot connect to the database', () => {
      it(`Should respond with an error that has a trimmed version of the internal error's message.
        The trimming should remove all text before the first colon and the colon itself.`, () => {
        metadataControllerStub.returns(Promise.reject(errorWithCode('ER_BAD_DB_ERROR', 'TRIM THIS: KEEP THIS')));

        return graphController.getAllGraphData(request, response)
          .then(() => {
            expect(response.statusVal).to.equal(500);
            expect(response.sendVal).to.have.property('message', 'KEEP THIS');
          });
      });
    });

    context('when getAllTableMetadata has an internal error because of a login issue', () => {
      it(`Should respond with an error that has a trimmed version of the internal error's message.
      The trimming should remove all text before the first colon and the colon itself. It should
      also remove the first '(' character and any text following. `, () => {
        metadataControllerStub.returns(
          Promise.reject(errorWithCode('ER_ACCESS_DENIED_ERROR', 'TRIM THIS: KEEP THIS (TRIM THIS TOO)')));

        return graphController.getAllGraphData(request, response)
          .then(() => {
            expect(response.statusVal).to.equal(500);
            expect(response.sendVal).to.have.property('message', 'KEEP THIS');
          });
      });
    });

    context('when instantiation an object of Graph throws an error', () => {
      it('should respond with an error', () => {
        metadataControllerStub.returns(Promise.resolve());

        const graphStub = sinon.stub(Graph.prototype, 'populate')
          .throws(new Error());

        return graphController.getAllGraphData(request, response)
          .then(() => {
            graphStub.restore();
            expect(response.statusVal).to.equal(500);
            expect(response.sendVal).to.have.property('message');
          });
      });
    });

    context('when there are no errors', () => {
      it('the call back should send a new Graph with the results', () => {
        const formattedMetadata = [{
          name: 'Doctor',
          columns: [],
        }];

        metadataControllerStub.returns(Promise.resolve(
          formattedMetadata));

        const expectedOutcome = {
          cells: [{
            id: 0,
            columns: [],
            tableName: 'Doctor',
          }],
          links: [],
        };

        return graphController.getAllGraphData(request, response)
          .then(() => {
            expect(response.statusVal).to.equal(200);
            const result = JSON.stringify(response.sendVal);
            const expected = JSON.stringify(expectedOutcome);
            expect(result).to.eql(expected);
          });
      });
    });
  });
});
