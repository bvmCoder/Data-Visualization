const chai = require('chai');

chai.should();
const expect = chai.expect;

const contractErrorStringGenerator =
  require('../../../testing_utils').contractErrorStringGenerator;

const dbNamesReducer =
  require('../../../../clientSide/redux/reducers/dbNamesReducer')
          .dbNamesReducer;

describe('dbNamesReducer', () => {
  context('when the current state is not an object', () => {
    it('should throw the appropriate error', () => {
      expect(() => {
        dbNamesReducer(null, null);
      }).to.throw(TypeError,
        contractErrorStringGenerator('currentState', 'Object', 'Null', 'null'));
    });
  });

  context('when the action type is not known', () => {
    it('should return a state identical to the previous state', () => {
      const prevState = { testString: 'previousState' };
      const newState = dbNamesReducer(prevState, { type: ' _UNKNOWN_TYPE_' });
      expect(newState).to.eql(prevState);
    });
  });

  context('when the action is of type REPLACE_DATABASE_NAMES', () => {
    const prevState = {};
    const typeObj = { type: 'REPLACE_DATABASE_NAMES' };
    let dbInfo;
    let expectedDbNames;

    context('when action.dbNames is not an array', () => {
      beforeEach(() => {
        expectedDbNames = null;
        dbInfo = {};
        dbInfo.dbNames = expectedDbNames;
      });

      it('should throw the appropriate error', () => {
        expect(() => {
          dbNamesReducer(prevState, Object.assign({}, dbInfo, typeObj));
        }).to.throw(contractErrorStringGenerator('action.dbNames', 'Array', 'Null', 'null'));
      });
    });

    context('when action.dbNames is an empty array', () => {
      beforeEach(() => {
        expectedDbNames = [];
        dbInfo = {};
        dbInfo.dbNames = expectedDbNames;
      });

      it('should return a state with dbNames as an empty array', () => {
        const newState = dbNamesReducer(prevState, Object.assign({}, dbInfo, typeObj));
        expect(newState.dbNames).to.eql(expectedDbNames);
      });
    });

    context('when action.dbNames has database names', () => {
      beforeEach(() => {
        expectedDbNames = ['database a', 'database b'];
        dbInfo = {};
        dbInfo.dbNames = expectedDbNames;
      });

      it('should return a state with dbNames as an array with database names', () => {
        const newState = dbNamesReducer(prevState, Object.assign({}, dbInfo, typeObj));
        expect(newState.dbNames).to.eql(expectedDbNames);
      });
    });
  });
});
