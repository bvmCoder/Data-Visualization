
exports.ErrorMessages = {};
exports.ErrorFriendlyMessages = {};

exports.ErrorMessages.NO_TABLES_RETRIEVED =
  'No tables were retrieved.';
exports.ErrorMessages.INVALID_ARGUMENT_ARRAY_EXPECTED =
  'Invalid Argument Datatype: Array is expected';
exports.ErrorMessages.TABLE_MUST_HAVE_A_NAME =
  'The table must have a name';
exports.ErrorMessages.COLUMN_MUST_HAVE_REFERENCE_TABLE_PROPERTY =
  'The column should have a referenceTable property';
exports.ErrorMessages.INVALID_EVT_OBJECT =
  'A valid event object must be provided as an argument for event handlers';
exports.ErrorMessages.INVALID_ARGUMENT_TABLE_EXPECTED =
  'Invalid Argument: A table object is expected';
exports.ErrorMessages.INDEX_OUT_OF_BOUNDS =
  'Index out of bounds: Index expected to be non-negative';
exports.ErrorMessages.UNDEFINED_RNG =
  'The random number generator has not been defined';
exports.ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT =
  'Invalid Argument: A knex object is expected';
exports.ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE =
  'Invalid Argument: The number of tables must be non-negative';
exports.ErrorMessages.INVALID_APP_STATE =
  'A valid appState must be provided as an argument to get a dbListListener';
exports.ErrorMessages.INVALID_OR_MISSING_QUERY_ARGUMENT =
  'Missing or Invalid Argument: A valid query must be provided to retrieve data.';
exports.ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT =
  'Missing or Invalid Argument: A valid cache object is expected when querying the database';
exports.ErrorMessages.INVALID_OR_MISSING_TABLE_NAME_ARGUMENT =
  'Missing or Invalid Argument: A valid table name must be provided.';
exports.ErrorMessages.INVALID_OR_MISSING_DATABASE_NAME_ARGUMENT =
  'Missing or Invalid Argument: A valid database name must be provided.';
exports.ErrorMessages.INVALID_OR_MISSING_PLACEHOLDER_TEXT =
  'Invalid Or Missing Argument: Valid placeholder text for search input must be provided.';
exports.ErrorMessages.INVALID_OR_MISSING_CONTAINER =
  'Invalid or Missing Argument: A valid visualization container selector string or element must be provided.';
exports.ErrorMessages.INVALID_OR_MISSING_MENU_TEXT =
  'Invalid or Missing Argument: Valid menu text must be provided.';

exports.ErrorMessages.INVALID_PAPER = {};
exports.ErrorMessages.INVALID_PAPER.PANNER =
  'The PaperPanner does not have a valid paper.';
exports.ErrorMessages.INVALID_PAPER.ZOOMER =
  'The PaperZoomer does not have a valid paper.';
exports.ErrorFriendlyMessages.DATABASE_RETRIEVAL_ERROR =
  'Error occurred when retrieving database table metadata!';

exports.ErrorFriendlyMessages.GRAPH_GENERATION_ERROR =
  'Error occurs when generating E-R graph';
exports.ErrorFriendlyMessages.INVALID_SEARCH_CRITERIA =
  'Invalid search criteria. Please enter valid search criteria.';
