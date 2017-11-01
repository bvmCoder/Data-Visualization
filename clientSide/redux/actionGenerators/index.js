/**
 * Helps generate a metadata replacement action.
 * @param {string} type - The type of the action.
 * @param {object[]} newCells - The cells of the metadata graph.
 * @param {object[]} newLinks - The links of the metadata graph.
 * @returns (object{}) The action to replace metadata. It holds the new metadata.
 */
const replaceMetadataActionGeneratorHelper = (type, newCells, newLinks) => ({
  type: type,
  cells: newCells,
  links: newLinks,
});
/**
 * Generates an action to replace the current metadata cells and links.
 * @param {object[]} newCells - The cells of the metadata graph.
 * @param {object[]} newLinks - The links of the metadata graph.
 * @returns (object{}) The action to replace metadata. It holds the new metadata.
 */
const replaceAllMetadataActionGenerator = (newCells, newLinks) =>
  replaceMetadataActionGeneratorHelper('REPLACE_ALL_METADATA', newCells, newLinks);

/**
 * Generates an action to replace the displayed metadata cells and links.
 * @param {object[]} newCells - The cells of the metadata graph.
 * @param {object[]} newLinks - The links of the metadata graph.
 * @returns (object{}) The action to replace metadata. It holds the new metadata.
 */
const replaceDisplayedMetadataActionGenerator = (newCells, newLinks) =>
  replaceMetadataActionGeneratorHelper('REPLACE_DISPLAYED_METADATA', newCells, newLinks);


module.exports.replaceDisplayedMetadataActionGenerator = replaceDisplayedMetadataActionGenerator;
module.exports.replaceAllMetadataActionGenerator = replaceAllMetadataActionGenerator;

/**
 * Generates an action to replace the current list of database names
 * @param {String[]} newDbNames - The list of databases in the server
 * @returns (object{}) The action to replace database information.
 */
const replaceDbNamesActionGenerator = newDbNames => ({
  type: 'REPLACE_DATABASE_NAMES',
  dbNames: newDbNames,
});

/**
 * Generates an action to replace the current database name
 * @param {String} newCurrentDbName - The current database
 * @returns (object{}) The action to replace database information.
 */
const replaceCurrentDbNameActionGenerator = newCurrentDbName => ({
  type: 'REPLACE_CURRENT_DATABASE_NAME',
  currentDbName: newCurrentDbName,
});

module.exports.replaceDisplayedMetadataActionGenerator = replaceDisplayedMetadataActionGenerator;
module.exports.replaceAllMetadataActionGenerator = replaceAllMetadataActionGenerator;
module.exports.replaceDbNamesActionGenerator = replaceDbNamesActionGenerator;
module.exports.replaceCurrentDbNameActionGenerator = replaceCurrentDbNameActionGenerator;
