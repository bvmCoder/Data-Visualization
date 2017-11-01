const graphUpdater = require('./graphOperations/updateGraph');
const graphSearcher = require('./graphOperations/searchGraph');
const resetVisualization = require('./graphOperations/resetVisualization').resetVisualization;
const refreshFromDB = require('./networkOperations/refreshFromDB').refreshFromDB;
const autocompleter = require('./autocompleteSearch');
const writeTablesList = require('./viewHelpers/writeTablesList').writeTablesList;
const rootReducer = require('./redux/reducers').rootReducer;
const $ = require('jquery');
const Awesomplete = require('awesomplete');
const redux = require('redux');
const dbListUpdater = require('./networkOperations/updateDBList');
const VisualizationControls = require('./viewHelpers/VisualizationControls');

const appState = redux.createStore(rootReducer);


$(() => {
  const container = $('#umlVisualizer')[0];

  graphUpdater.updateGraph(container, location.origin, appState);
  const controls = new VisualizationControls($('#visualization-wrapper'));

  const searchBox = controls.addSearch('Search By Table or Column Name...');
  const autoCompleteSearchSuggester =
    new Awesomplete(searchBox[0], {
      list: [],
      item: text => Awesomplete.ITEM(text, ''),
      filter: () => true,
    });
  controls.addItem('Reset Visualization', () => {
    resetVisualization(container, appState);
    autoCompleteSearchSuggester.list = [];
  });
  // Sends requests to clear the server's database cache and then get fresher DB data
  controls.addItem('Refresh from DB', () => {
    refreshFromDB(container, location.origin, appState);
  });
  controls.addItem('List Tables', () => {
    writeTablesList(appState, '#tableListModal');
  });
  searchBox.on('keyup', (evt) => {
    const enterKeyCode = 13;
    const minimumNumberOfCharsToAutoSuggest = 3;
    const charCode = evt.keyCode;
    const searchBoxValue = searchBox.val();
    // on the enter key submit a search and remove the autocomplete options
    if (charCode === enterKeyCode) {
      graphSearcher.searchGraph(
        container,
        searchBox.val(),
        appState.getState().allMetadataReducer,
        appState,
      );
      autoCompleteSearchSuggester.list = [];
    // only autocomplete after a specific number of characters have been typed
    } else if (searchBoxValue.length >= minimumNumberOfCharsToAutoSuggest) {
      autocompleter.autocompleteSearch(
        searchBoxValue,
        (newList) => { autoCompleteSearchSuggester.list = newList; },
        appState,
      );
    // if nothing is in the search box then clear the autocomplete items
    } else if (searchBoxValue === '') {
      autoCompleteSearchSuggester.list = [];
    }
  });
  searchBox.on('awesomplete-selectcomplete', () => {
    graphSearcher.searchGraph(container,
      searchBox.val(),
      appState.getState().allMetadataReducer,
      appState);
    autoCompleteSearchSuggester.list = [];
  });

  // The event for when a new database is selected
  // Since database selection is not yet implemented, the selected database cannot be changed
  $('#database-select').change((evt) => {
    const state = appState.getState().currentDbNameReducer;
    $(evt.target).val(state.currentDbName);
  });

  // Subscribes the listener to changes in the appState
  appState.subscribe(dbListUpdater.getDbListListener(appState));

  // Updates the database list, which triggers the listener
  dbListUpdater.updateDBList(location.origin, appState);
});
