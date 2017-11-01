const combineReducers = require('redux').combineReducers;
const currentDbNameReducer = require('./currentDbNameReducer').currentDbNameReducer;
const dbNamesReducer = require('./dbNamesReducer').dbNamesReducer;
const metadataReducers = require('./metadataReducer');

// Reducers are combined here so that state can be centralized
const rootReducer = combineReducers({
  currentDbNameReducer,
  dbNamesReducer,
  allMetadataReducer: metadataReducers.allMetadataReducer,
  displayedMetadataReducer: metadataReducers.displayedMetadataReducer,
});

module.exports.rootReducer = rootReducer;
