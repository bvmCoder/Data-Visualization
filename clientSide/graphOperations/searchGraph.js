const _ = require('lodash');
const errorNotifier = require('../viewHelpers/errorNotifier');
const networkGenerator = require('./generateGraph');
const errorMessages = require('../../app/utility/messages').ErrorFriendlyMessages;

/**
 * Determines if a link on a side not of the index param has a relation type of 'many'.
 * @param {Object} link - The link to examine.
 * @param {Number} index - The index to avoid the side of.
 * @returns {Boolean} - Is true if the side of the link w/o the index has a MANY relation.
*/
const isTypeManyOnOtherSide = (link, index) =>
  ((link.destinationRelationshipType.name === 'MANY' && link.destination !== index) ||
  (link.sourceRelationshipType.name === 'MANY' && link.source !== index));

/**
 * Retrieve the index that is not the param index of the link.
 * @param {Object} link - The link to find the other index of.
 * @param {Number} index - The index of the link, to not return.
 * @returns {Number} The link's source and destination that is not equal to the index.
 */
const getOtherIndexOfLink = (link, index) =>
  ((link.destination === index) ? link.source : link.destination);

/**
 * Determines if the link has a many relationship at source with the index param and
 * the destination does not equal the index to avoid.
 * @param {Object} link - The link to examine.
 * @param {Number} index - The index to check if the link's source matches.
 * @param {Number} indexToAvoid - The index to check if the link's destination matches.
 * @returns {Boolean} - Value based on the condition in the function description.
 */
const hasManySourceRelationWithIndexDestinationNotAnotherIndex =
  (link, index, indexToAvoid) =>
    link.source === index &&
    link.sourceRelationshipType.name === 'MANY' &&
    link.destination !== indexToAvoid;

/**
 * Determines if the link has a many relationship at destination with the index param and
 * the source does not equal the index to avoid.
 * @param {Object} link - The link to examine.
 * @param {Number} index - The index to check if the link's destination matches.
 * @param {Number} indexToAvoid - The index to check if the link's source matches.
 * @returns {Boolean} - Value based on the condition in the function description.
 */
const hasManyDestinationRelationWithIndexSourceNotAnotherIndex =
  (link, index, indexToAvoid) =>
    (link.destination === index &&
    link.destinationRelationshipType.name === 'MANY' &&
    link.source !== indexToAvoid);

/**
 * Takes a list of links and returns a set of all the indices touched by the links.
 * @param {[Object]} links - A list of links.
 * @returns {Set} - A set of the the indices the links link to.
 */
const getIndicesOfLinksAsSet = links =>
  links.reduce(
    (set, link) => {
      set.add(link.source);
      set.add(link.destination);
      return set;
    }, new Set());

/**
 * Given the index of a cell, the cell itself is found. Then, the cells one link away
 * are found. Both the target cell and the others are returned, along with the links.
 * @param {Number} targetCellIndex - The index of the target cell in the cell list.
 * @param {[Object]} cells - All the cells of the graph.
 * @param {[Object]} links - All the links of the graph.
 * @returns {{links, cells}} - The found target cell and the cells one link away from it
 *  and the links between target cell and the cells one link away as an object.
 */
const getRelatedCellsAndLinks = (targetCellIndex, cells, links) => {
  if (targetCellIndex >= cells.length) {
    throw new RangeError('Target index must be less than the length of the cell list.');
  }

  if (targetCellIndex < 0) {
    throw new RangeError('Target index must be positive.');
  }

  // These are all the links the target cell is a source or destination of.
  const relevantLinks = links
    .filter(link => link.source === targetCellIndex || link.destination === targetCellIndex);

  // This set contains indices of cells linked to the matching cell. And the matching cell's index.
  const targetCellsIndicesSet = getIndicesOfLinksAsSet(relevantLinks).add(targetCellIndex);

  // A list of cells that link to the target cell or are the target cell (no duplicates).
  const relevantCells = [...targetCellsIndicesSet].map(index => cells[index]);
  return { links: relevantLinks, cells: relevantCells };
};

/**
 * For the cell at the targetCellIndex this function returns all of the cells of tables
 * that are joined to the table that the target cell represents. It also returns the links
 * that connect the joined tables to join tables. So, if table/cell A is linked to the join
 * table/cell B which joins table/cell A with table/cell C this function will return table C
 * and the link between C and B.
 *
 * Join tables are defined as tables with two different relationships of type 'MANY' on
 * their side of the relationship's link.
 *
 * @param {Number} targetCellIndex - The cell of interest's index (referred to
 *  as the target cell).
 * @param {[Object]} targetCellLinks - The links connected to the target cell.
 * @param {[Object]} allGraphCells - All of the cells in the graph.
 * @param {[Object]} allGraphLinks - All of the links in the graph.
 * @returns {{cells, links}} - The cells that are connected via a join relationship
 * with the target cell. The links connect the cell to the join table's cell that is
 * subsequently linked to the target cell.
 */
const getJoinedCellsAndLinksToJoin =
  (targetCellIndex, targetCellLinks, allGraphCells, allGraphLinks) => {
    if (targetCellIndex >= allGraphCells.length) {
      throw new RangeError('Target index must be less than the length of the all cells list.');
    }

    if (targetCellIndex < 0) {
      throw new RangeError('Target index must be positive.');
    }

    // A list of links to the target cell with type 'MANY' on the side of the non-target cell.
    const manyOnNonTargetSideLinks =
      targetCellLinks.filter(link => isTypeManyOnOtherSide(link, targetCellIndex));

    /* Indices of cells linked to the matched cell, with type 'MANY' on their side of the link.
     * These are the indices of the join table representing cells.
     */
    const joinIndices =
      manyOnNonTargetSideLinks.map(link => getOtherIndexOfLink(link, targetCellIndex));

    /* Taking the joins indices list created above, a list of cells and link pairs are created.
     * The links connect the cell of the pair to a cell with an index in the new list of
     * indices. The links must have a type of 'MANY' on the side the join cell. Thus the cell of
     * the pair represents the table that is being joined to the target cell and the link is
     * the relation of that cell to the join cell.
     */
    const manyToManyCellAndLinkList = joinIndices.map((index) => {
      const linkFromJoinToNonTargetCell =
        _.find(allGraphLinks, link =>
          hasManySourceRelationWithIndexDestinationNotAnotherIndex(link, index, targetCellIndex) ||
          hasManyDestinationRelationWithIndexSourceNotAnotherIndex(link, index, targetCellIndex));
      return {
        link: linkFromJoinToNonTargetCell,
        cell: allGraphCells[getOtherIndexOfLink(linkFromJoinToNonTargetCell, index)],
      };
    });
    return {
      cells: manyToManyCellAndLinkList.map(cellAndLink => cellAndLink.cell),
      links: manyToManyCellAndLinkList.map(cellAndLink => cellAndLink.link),
    };
  };

/**
 * Takes the links and looks up the index of what each link pointed to in oldCellList.
 * Then the cell that is at the old index is found in the newCell list. Then the old index
 * is replaced with the updated index of the location of the cell in the newCell list.
 * This is done for both source and destination.
 * @param {[Object]} links - The graph links to relink.
 * @param {[Object]} oldCellList - The cells list the links are currently point into.
 * @param {[Object]} newCellList - The new cell list that the links need to point into.
 */
const relinkLinks = (links, oldCellList, newCellList) =>
  links.map((link) => {
    const destinationCell = oldCellList[link.destination];
    const newDestinationIndex =
      _.findIndex(newCellList, { tableName: destinationCell.tableName });

    const sourceCell = oldCellList[link.source];
    const newSourceIndex = _.findIndex(newCellList, { tableName: sourceCell.tableName });

    const newLink = _.clone(link);
    newLink.destination = newDestinationIndex;
    newLink.source = newSourceIndex;

    return newLink;
  });

/**
 * Searches the metadataState graph for a table/cell with a title that matches
 * the search criteria. The links and cells immediately connected to the "matched
 * cell" are also collected. Finally, if any of the collected cells is a join table
 * then the link and cell on the other side of the join is also included in the
 * results. These results are then passed to call to networkGenerator's generateGraph.
 *
 * The errorNotifier's alertError will be called if no cell can be found with a title
 * equivalent to the searchCriteria parameter.
 *
 * @param {object} container - The container object used as a canvas for drawing
 * @param {string} searchCriteria - The criteria to search the graph with
 * @param {object} allMetadata - The part of the application state with cell and
 *  link info.
 * @param {object} appState - The state of the application.
 */

const searchGraph = (container, searchCriteria, metadataState, appState) => {
  const allCells = metadataState.cells;
  const allLinks = metadataState.links;

  /* The target cell has a title that matches the searchCriteria string.
   * It is the focus of the search as all other cells displayed are related to it.
   */
  const targetCellIndex = _.findIndex(allCells, { tableName: searchCriteria });

  /* If there is no cell that has a title that matches the search criteria, an error
   * is thrown using the error notifier and execution stops.
   */
  if (targetCellIndex === -1) {
    const invalidSearchCriteriaError = new Error(errorMessages.INVALID_SEARCH_CRITERIA);
    errorNotifier.alertError(invalidSearchCriteriaError);
    return;
  }

  /* get the cells surrounding the targetCell (including the target cell) and the links
   * between the target cell and these related (1 link away) cells.
   */
  const relatedCellsAndLinks = getRelatedCellsAndLinks(targetCellIndex, allCells, allLinks);
  const relatedCells = relatedCellsAndLinks.cells;
  const relatedLinks = relatedCellsAndLinks.links;

  /* get the cells that are joined to the targetCell and the links connecting the join table
   * representing cell and the non-'target cell' cells.
   */
  const manyToManyCellAndLinkList =
    getJoinedCellsAndLinksToJoin(targetCellIndex, relatedLinks, allCells, allLinks);
  const manyToManyCells = manyToManyCellAndLinkList.cells;
  const manyToManyLinks = manyToManyCellAndLinkList.links;

  // combine, uniquely, the cells and links found so far
  const finalizedCells = _.uniq(relatedCells.concat(manyToManyCells));
  const linksToRelink = _.uniq(relatedLinks.concat(manyToManyLinks));

  /* fix the links which are based on the allCells indices and should use the
   * finalizedCells indices instead.
   */
  const finalizedLinks = relinkLinks(linksToRelink, allCells, finalizedCells);

  networkGenerator.generateGraph(finalizedCells, finalizedLinks, container, appState);
};

module.exports = {
  __hasManySourceRelationWithIndexDestinationNotAnotherIndex:
  hasManySourceRelationWithIndexDestinationNotAnotherIndex,
  __hasManyDestinationRelationWithIndexSourceNotAnotherIndex:
  hasManyDestinationRelationWithIndexSourceNotAnotherIndex,
  __getOtherIndexOfLink: getOtherIndexOfLink,
  __isTypeManyOnOtherSide: isTypeManyOnOtherSide,
  __getIndicesOfLinksAsSet: getIndicesOfLinksAsSet,
  __relinkLinks: relinkLinks,
  __getJoinedCellsAndLinksToJoin: getJoinedCellsAndLinksToJoin,
  __getRelatedCellsAndLinks: getRelatedCellsAndLinks,
  searchGraph: searchGraph,
};
