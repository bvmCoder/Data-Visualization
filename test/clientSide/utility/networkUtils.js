const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const assert = require('chai').assert;
const _ = require('lodash');
chai.use(require('chai-as-promised'));

chai.should();

const codeUnderTest = require('../../../clientSide/utility/networkUtils');

describe('getReduce', () => {
  let serverMock;
  let onError;
  let onSuccess;
  const accumulator = sinon.spy((data, response) => {
    const newData = response.data.map(op => op.TABLE_NAME);
    return _.uniq(data.concat(newData));
  });
  const urls = ['1', '2', '3'];
  beforeEach(() => {
    serverMock = new MockAdapter(axios);
  });
  afterEach(() => {
    // force reassignment
    onError = null;
    onSuccess = null;
  });
  it('Should call the onError method in case of an error', (done) => {
    serverMock.onGet('500');
    onSuccess = sinon.spy();
    onError = sinon.spy((() => {
      assert(onSuccess.notCalled);
      done();
    }));
    codeUnderTest.getReduce(urls, accumulator, onSuccess, onError, []);
  });
  it('Should call the onSuccess method with the accumulated data', (done) => {
    serverMock.onGet().reply(200, [{ TABLE_NAME: 'Person' }, { TABLE_NAME: 'Address' }]);
    onError = sinon.spy();
    onSuccess = sinon.spy((() => {
      assert(onError.notCalled);
      assert(onSuccess.calledWith(['Person', 'Address']));
      done();
    }));
    codeUnderTest.getReduce(urls, accumulator, onSuccess, onError, []);
  });
});
