const errorNotifier = require('../viewHelpers/errorNotifier');
const actionGenerators = require('../redux/actionGenerators');

const jointjs = require('jointjs');

/**
 * This file generates a network-style graph with cells (representing tables) and links
 * (representing the relationship(s) between tables)
 */

const graphElementFactory = require('../../app/utility/graphElementFactory');

/**
 * Creates jointJS cells from a list of cell objects
 *
 * @param {Cell[]} cells: An array of cell objects
 * @return {Object[]} Returns an array of joinJS uml cell objects
 */
const generateJointJsCellsFromListOfCells = cells =>
  // Go through the cells and create a new jointJS cell for each one
  cells.map(cell => graphElementFactory.createJointJsCell(cell));

/**
 * Creates jointJS links from a list of link objects
 *
 * @param {Link[]} links: An array of link objects
 * @return {Object[]} Returns an array of joinJS link objects
 */
const generateJointJsLinksFromListOfLinks = links =>
  // Go through the links and create new jointJS links for each one
  links.map(link => graphElementFactory.createJointJsLink(link));

/**
 * Creates a network that visualizes a UML Diagram of tables and their relationships.
 * Saves the data required to do so into the app state's displayedMetadataReducer
 * @param listOfCells: An array of cell objects
 * @param listOfLinks: An array of link objects
 * @param container: The container object used as a canvas for drawing
 * @param appState: The state of the application
 */
module.exports.generateGraph = function generateGraph(
  listOfCells,
  listOfLinks,
  container,
  appState) {
  try {
    // Create the jointJS graph to hold the links and cells
    const graph = graphElementFactory.createJointJsGraph();

    /* Create the jointJs paper to associate the graph with
     * eslint-disable-next-line no-unused-vars
     */
    const paper = graphElementFactory.createJointJsPaper(graph, container);

    // Go through the cells and create a new jointJS uml cell for each one
    const jointJSCells = generateJointJsCellsFromListOfCells(listOfCells);

    /* Array of id that map to the dynamically created ids for each cell in joinJSCells; used to
     * give the links the ids they need to link cells
     */
    const idsOfCells = jointJSCells.map(cell => cell.id);

    // Replace index reference for links with jointJs id reference of cell
    const formattedLinks = listOfLinks.map((link) => {
      // Copy the link object to avoid editing the original
      const newLink = Object.assign({}, link, {
        // Replace the index references with the joinJs id references
        source: idsOfCells[link.source],
        destination: idsOfCells[link.destination],
      });
      return newLink;
    });

    // Go through the links and create new jointJS links for each one
    const jointJSLinks = generateJointJsLinksFromListOfLinks(formattedLinks);

    // Draw graph with jointJs cells and links
    graph.addCells(jointJSCells);
    graph.addCells(jointJSLinks);

    // Use DirectedGraph plugin to automatically rearrange cells
    jointjs.layout.DirectedGraph.layout(graph, { setLinkVertices: false });

    // Create the panner to attach to the paper
    graphElementFactory.createJointJsPaperPanner(paper);

    // Create the zoomer to attach to the paper
    graphElementFactory.createJointJsPaperZoomer(paper);

    const replaceMetadataAction = actionGenerators
      .replaceDisplayedMetadataActionGenerator(listOfCells, listOfLinks);

    appState.dispatch(replaceMetadataAction);
  } catch (error) {
    errorNotifier.alertError(new Error(`Error generating the graph: ${error.message}`));
  }
};
