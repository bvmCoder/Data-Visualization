const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const jsverify = require('jsverify');
const shuffleSeed = require('shuffle-seed');

const errorMessages = require('../../../app/utility/messages').ErrorFriendlyMessages;
const codeUnderTest = require('../../../clientSide/graphOperations/searchGraph');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const generateGraph = require('../../../clientSide/graphOperations/generateGraph');

chai.use(require('chai-as-promised'));

chai.should();

const jsVerifyOptions = {
/* rngState is like a random state seed.
 * Keeping it the same leads to the same tests being run, which makes debugging easier.
 */
  rngState: '074e9b5f037a8c21d6',
  tests: 100,
  quiet: true, // no console output
};

/**
 * Converts a link to a string using all information available.
 * @param {Object} link - The link to turn into a string
 * @returns {String} - The stringified version of the link param.
 */
const linkToString = link =>
  `Destination: ${link.destination.toString()} 
       Destination Relation: ${link.destinationRelationshipType}
       Source: ${link.source.toString()} 
       Source Relation: ${link.sourceRelationshipType}`;

/**
 * Returns true at a probability equal to the input as a percentage.
 * @param {Number} x - A positive integer equal to the probability of returning true.
 * @returns {Boolean} - True at the odds specified by the x param.
 */
const percentChance = x => (jsverify.random(0, 100) < x);
/**
 * Creates a graph arbitrary with a number of cells between the min and max.
 * @param minNumberOfCells - The minimum number of cells of the graph.
 * @param maxNumberOfCells - The maximum number of cells of the graph.
 * @returns {Object} - A graph arbitrary possibly with links and joins.
 */
const graphAndTargetInfoArbitraryWithCellCount = (minNumberOfCells = 0, maxNumberOfCells = 10) => (
  jsverify.bless({
    generator: () => {
      // Constants
      const sourceDestAssignmentChance = 50;
      const createJoinChance = 20;
      const createRegLinkChance = 30;

      // Create cells
      const numberOfCells = jsverify.random(minNumberOfCells, maxNumberOfCells);
      const indices = _.range(numberOfCells);
      let cells = indices.map(num => ({ tableName: num.toString() }));
      // Create indices pairs for links
      const indicesWithHigherIndices = indices.map(index => ({
        index: index,
        higherIndices: _.range(index + 1, numberOfCells),
      }));
      const indicesWithSomeHigherIndices = indicesWithHigherIndices.map(iWHIElement => ({
        index: iWHIElement.index,
        someHigherIndices: iWHIElement.higherIndices.filter(() => jsverify.random(0, 1) === 0),
      }));
      const pairsOfIndices = _.flatten(indicesWithSomeHigherIndices.map(iWSHIElement =>
        iWSHIElement.someHigherIndices.map(
          iWSHIElementHigherIndex => [iWSHIElement.index, iWSHIElementHigherIndex])));
      // Info holders for doing tests
      const links = [];
      const joinLinks = [];
      const joinCells = [];
      const cellsToJoinLinksInfoMap = {};
      indices.forEach((dict, index) => {
        cellsToJoinLinksInfoMap[index] = [];
      }, {});
      const cellToRegLinksInfoMap = {};
      indices.forEach((dict, index) => {
        cellToRegLinksInfoMap[index] = [];
      }, {});
      // Create links
      pairsOfIndices.forEach((pair) => {
        const randNum0To100 = jsverify.random(0, 100);
        if (randNum0To100 < createJoinChance) {
          // create a join
          const joinCell = { tableName: `${pair[0]}join${pair[1]}` };
          joinCells.push(joinCell);
          const firstOfPairLink = percentChance(sourceDestAssignmentChance) ?
          { source: pair[0],
            destination: cells.length + joinCells.length + -1,
            destinationRelationshipType: { name: 'MANY' },
            sourceRelationshipType: { name: 'TEST_LINK_TYPE' },
          } : {
            destination: pair[0],
            source: cells.length + joinCells.length + -1,
            destinationRelationshipType: { name: 'TEST_LINK_TYPE' },
            sourceRelationshipType: { name: 'MANY' },
          };
          const secondOfPairLink = (percentChance(sourceDestAssignmentChance) ?
          { source: pair[1],
            destination: cells.length + joinCells.length + -1,
            destinationRelationshipType: { name: 'MANY' },
            sourceRelationshipType: { name: 'TEST_LINK_TYPE' },
          } : {
            destination: pair[1],
            source: cells.length + joinCells.length + -1,
            destinationRelationshipType: { name: 'TEST_LINK_TYPE' },
            sourceRelationshipType: { name: 'MANY' },
          });
          // Save information about join
          links.push(firstOfPairLink);
          links.push(secondOfPairLink);
          joinLinks.push(firstOfPairLink);
          joinLinks.push(secondOfPairLink);
          cellsToJoinLinksInfoMap[pair[0]].push({
            linkWith: firstOfPairLink,
            joinCell: joinCell,
            joinCellOtherCellLink: secondOfPairLink,
            otherCellIndex: pair[1],
          });
          cellsToJoinLinksInfoMap[pair[1]].push({
            linkWith: secondOfPairLink,
            joinCell: joinCell,
            joinCellOtherCellLink: firstOfPairLink,
            otherCellIndex: pair[0],
          });
          // If there is no join, determine if a regular link should be made
        } else if (randNum0To100 < createJoinChance + createRegLinkChance) {
          const link = percentChance(sourceDestAssignmentChance) ?
            { source: pair[0], destination: pair[1] } :
            { source: pair[1], destination: pair[0] };
          link.destinationRelationshipType = { name: 'TEST_LINK_TYPE' };
          link.sourceRelationshipType = { name: 'TEST_LINK_TYPE' };
          links.push(link);
          cellToRegLinksInfoMap[pair[0]].push({ link: link, otherCell: pair[1] });
          cellToRegLinksInfoMap[pair[1]].push({ link: link, otherCell: pair[0] });
        }
      });

      cells = cells.concat(joinCells);
      const target = jsverify.random(0, numberOfCells - 1);
      const graphInfo = {
        index: target,
        graph: { cells: cells, links: links },
        joinLinks: joinLinks,
        joinCells: joinCells,
        cellToRegLinksInfoMap: cellToRegLinksInfoMap,
        targetRegLinkInfo:
          cellToRegLinksInfoMap[target] === undefined ? [] : cellToRegLinksInfoMap[target],
        targetJoinInfo:
          cellsToJoinLinksInfoMap[target] === undefined ? [] : cellsToJoinLinksInfoMap[target],
        cellsToJoinLinksInfoMap: cellsToJoinLinksInfoMap,
      };
      return graphInfo;
    },
  }));

describe('SearchGraph and helper functions', () => {
  describe('hasManySourceRelationWithIndexDestinationNotAnotherIndex', () => {
    const functionUnderTest =
      codeUnderTest.__hasManySourceRelationWithIndexDestinationNotAnotherIndex;
    let link;
    const index = 100;
    const indexToAvoid = 10;
    beforeEach(() => {
      link = {};
    });
    context('link\'s source does not equal the index', () => {
      beforeEach(() => {
        link.source = index + 1;
      });
      it('should return false', () => {
        functionUnderTest(link, index, indexToAvoid).should.equal(false);
      });
    });
    context('link source equals index', () => {
      beforeEach(() => {
        link.source = index;
      });
      context(' link\'s sourceRelationshipType\'s name does not equal the MANY', () => {
        beforeEach(() => {
          link.sourceRelationshipType = { name: 'NOT_MANY' };
        });
        it('should return false', () => {
          functionUnderTest(link, index, indexToAvoid).should.equal(false);
        });
      });
      context('link source relation type name is MANY', () => {
        beforeEach(() => {
          link.sourceRelationshipType = { name: 'MANY' };
        });
        context('link\'s destination equals the indexToAvoid', () => {
          beforeEach(() => {
            link.destination = indexToAvoid;
          });
          it('should return false', () => {
            functionUnderTest(link, index, indexToAvoid).should.equal(false);
          });
        });
        context('destination does not equal indexToAvoid', () => {
          beforeEach(() => {
            link.destination = indexToAvoid + 1;
          });
          it('should return false', () => {
            functionUnderTest(link, index, indexToAvoid).should.equal(true);
          });
        });
      });
    });
  });

  describe('hasManyDestinationRelationWithIndexSourceNotAnotherIndex', () => {
    const functionUnderTest =
      codeUnderTest.__hasManyDestinationRelationWithIndexSourceNotAnotherIndex;
    let link;
    const index = 100;
    const indexToAvoid = 1;
    beforeEach(() => {
      link = {};
    });
    context('link\'s destination does not equal the index', () => {
      beforeEach(() => {
        link.destination = index + 1;
      });
      it('should return false', () => {
        functionUnderTest(link, index, indexToAvoid).should.equal(false);
      });
    });
    context('link source equals index', () => {
      beforeEach(() => {
        link.destination = index;
      });
      context('link\'s destinationRelationshipType\'s name does not equal the MANY', () => {
        beforeEach(() => {
          link.destinationRelationshipType = {
            name: 'NOT_MANY',
          };
        });
        it('should return false', () => {
          functionUnderTest(link, index, indexToAvoid).should.equal(false);
        });
      });
      context('link destination relation type name is MANY', () => {
        beforeEach(() => {
          link.destinationRelationshipType = {
            name: 'MANY',
          };
        });
        context('link\'s source equals the indexToAvoid', () => {
          beforeEach(() => {
            link.source = indexToAvoid;
          });
          it('should return false', () => {
            functionUnderTest(link, index, indexToAvoid).should.equal(false);
          });
        });
        context('source does not equal indexToAvoid', () => {
          beforeEach(() => {
            link.source = indexToAvoid + 1;
          });
          it('should return false', () => {
            functionUnderTest(link, index, indexToAvoid).should.equal(true);
          });
        });
      });
    });
  });

  describe('getOtherIndexOfLink', () => {
    const getOtherIndexOfLink = codeUnderTest.__getOtherIndexOfLink;
    context('when only the link\'s destination is equal to the index searched for', () => {
      it('should return the link\'s source\'s index', () => {
        getOtherIndexOfLink({ source: 1, destination: 0 }, 0).should.equal(1);
      });
    });
    context('when only the link\'s source is equal to the index searched for', () => {
      it('should return the link\'s destination\'s index', () => {
        getOtherIndexOfLink({ source: 1, destination: 0 }, 1).should.equal(0);
      });
    });
    context('when both the link\'s source and destination are equal to the index searched for', () => {
      it('should return the link\'s source\'s and destination\'s index', () => {
        getOtherIndexOfLink({ source: 1, destination: 1 }, 0).should.equal(1);
      });
    });
    context('when neither the link\'s source nor destination are equal to the index searched for', () => {
      it('should return the link\'s destination\'s index', () => {
        getOtherIndexOfLink({ source: 1, destination: 0 }, -1).should.equal(0);
      });
    });
  });

  describe('isTypeManyOnOtherSide', () => {
    const isTypeManyOnOtherSide = codeUnderTest.__isTypeManyOnOtherSide;
    let link;
    const index = 100;
    beforeEach(() => {
      link = {};
      link.destinationRelationshipType = {};
      link.sourceRelationshipType = {};
    });
    context('neither the link\'s source nor destination relation type is many', () => {
      beforeEach(() => {
        link.destinationRelationshipType.name = 'NOT_MANY';
        link.sourceRelationshipType.name = 'NOT_MANY';
      });
      context('only the link\'s source equals the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index + 1;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('only the link\'s destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('both the link\'s source and destination equal the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('neither the link\'s source nor destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index + 2;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
    });
    context('only the link\'s destination relation type is many', () => {
      beforeEach(() => {
        link.destinationRelationshipType.name = 'MANY';
        link.sourceRelationshipType.name = 'NOT_MANY';
      });
      context('only the link\'s source equals the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index + 1;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
      context('only the link\'s destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('both the link\'s source and destination equal the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('neither the link\'s source nor destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index + 2;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
    });
    context('only the link\'s source relation type is many', () => {
      beforeEach(() => {
        link.destinationRelationshipType.name = 'NOT_MANY';
        link.sourceRelationshipType.name = 'MANY';
      });
      context('only the link\'s source equals the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index + 1;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('only the link\'s destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
      context('both the link\'s source and destination equal the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('neither the link\'s source nor destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index + 2;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
    });
    context('the link\'s source and destination relation types are many', () => {
      beforeEach(() => {
        link.destinationRelationshipType.name = 'MANY';
        link.sourceRelationshipType.name = 'NOT_MANY';
      });
      context('only the link\'s source equals the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index + 1;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
      context('only the link\'s destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('both the link\'s source and destination equal the index', () => {
        beforeEach(() => {
          link.source = index;
          link.destination = index;
        });
        it('should return false', () => {
          isTypeManyOnOtherSide(link, index).should.equal(false);
        });
      });
      context('neither the link\'s source nor destination equals the index', () => {
        beforeEach(() => {
          link.source = index + 1;
          link.destination = index + 2;
        });
        it('should return true', () => {
          isTypeManyOnOtherSide(link, index).should.equal(true);
        });
      });
    });
  });

  describe('getIndicesOfLinksAsSet', () => {
    const getIndicesOfLinksAsSet = codeUnderTest.__getIndicesOfLinksAsSet;
    it('should return the indices of the links', () => {
      jsverify.assert(
        jsverify.forall(jsverify.array(jsverify.nat), jsverify.array(jsverify.nat),
          (sourceIndices, destinationIndices) => {
            // make the lists the same length so they can be safely zipped.
            const slicedSourceIndices = sourceIndices.slice(0, destinationIndices.length);
            const slicedDestIndices = destinationIndices.slice(0, sourceIndices.length);
            const links = _.zipWith(slicedSourceIndices, slicedDestIndices,
              (sourceIndex, destIndex) => ({ source: sourceIndex, destination: destIndex }));
            const resultArr = [...getIndicesOfLinksAsSet(links)];
            const expectedArr = _.uniq(slicedDestIndices.concat(slicedSourceIndices));
            return _.isEqual(resultArr.sort(), expectedArr.sort());
          }), jsVerifyOptions);
    });
  });

  describe('relinkLinks', () => {
    const relinkLinks = codeUnderTest.__relinkLinks;
    const maxNumberOfInsertions = 1000;
    /**
     * Creates a new list of links using relinkLinks and checks that the same cells
     * are pointed to by both the original links list and the new links list.
     * @param oldCells - The cells that the old links list point to.
     * @param oldLinks - The list of links to relink.
     * @param newCells - The list of cells to relink to.
     * @returns {boolean} - True if the cells pointed to in newCells by the re-linked link
     *  list are the same in number per identity as what the oldLinks pointed to in oldCells.
     */
    const relinkingPointsSameCellsAndCounts = (oldCells, oldLinks, newCells) => {
      const newLinks = relinkLinks(oldLinks, oldCells, newCells);
      const oldCellsByOriginalLinks = _.sortBy(_.flatten(oldLinks.map(link =>
        ([oldCells[link.source], oldCells[link.source]]))), cell => cell.tableName);
      const newCellsByNewLinks = _.sortBy(_.flatten(newLinks.map(link =>
        ([newCells[link.source], newCells[link.source]]))), cell => cell.tableName);
      return _.isEqual(oldCellsByOriginalLinks, newCellsByNewLinks);
    };
    context('the new list of cells is the same length as the old list of cells', () => {
      it('should result in links that point to indices of the same cells, the same number of times', () => {
        jsverify.assert(jsverify.forall(
          graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat,
          (graphAndTargetInfo, randomNatural) => {
            const oldLinks = graphAndTargetInfo.graph.links;
            const oldCells = graphAndTargetInfo.graph.cells;
            let newCells = _.clone(oldCells);
            newCells = shuffleSeed.shuffle(newCells, randomNatural);
            return relinkingPointsSameCellsAndCounts(oldCells, oldLinks, newCells);
          }));
      });
    });
    context('the new list of cells is longer than the old list of cells', () => {
      it('should result in links that point to indices of the same cells, the same number of times', () => {
        jsverify.assert(jsverify.forall(
          graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat, jsverify.array(jsverify.nat),
          (graphAndTargetInfo, randomNatural, insertionLocationsDeterminers) => {
            insertionLocationsDeterminers.slice(maxNumberOfInsertions);
            // ensure adding at least one cell
            if (insertionLocationsDeterminers.length === 0) {
              insertionLocationsDeterminers.push(randomNatural);
            }
            const oldLinks = graphAndTargetInfo.graph.links;
            const oldCells = graphAndTargetInfo.graph.cells;
            const newCells = shuffleSeed.shuffle(_.clone(oldCells), randomNatural);
            for (let counter = 0; counter < insertionLocationsDeterminers.length; counter += 1) {
              newCells.splice(insertionLocationsDeterminers[counter] % newCells.length, 0, {});
            }
            return relinkingPointsSameCellsAndCounts(oldCells, oldLinks, newCells);
          }));
      });
    });
    context('the old list of cells is longer than the new list of cells', () => {
      it('should result in links that point to indices of the same cells, the same number of times', () => {
        jsverify.assert(jsverify.forall(
          graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat, jsverify.array(jsverify.nat),
          (graphAndTargetInfo, randomNatural, insertionLocationsDeterminers) => {
            insertionLocationsDeterminers.slice(maxNumberOfInsertions);
            // ensure at least one cell is added
            if (insertionLocationsDeterminers.length === 0) {
              insertionLocationsDeterminers.push(randomNatural);
            }
            let oldLinks = graphAndTargetInfo.graph.links;
            const oldCells = graphAndTargetInfo.graph.cells;
            const newCells = shuffleSeed.shuffle(_.clone(oldCells), randomNatural);
            // insert cells into oldCells and adjust oldLinks accordingly
            for (let insertionCounter = 0;
                 insertionCounter < insertionLocationsDeterminers.length; insertionCounter += 1) {
              const insertionLocation =
                insertionLocationsDeterminers[insertionCounter] % oldCells.length;
              oldCells.splice(insertionLocation, 0, {});
              oldLinks = oldLinks.map((link) => {
                const linkCopy = _.cloneDeep(link);
                if (linkCopy.source >= insertionLocation) linkCopy.source += 1;
                if (linkCopy.destination >= insertionLocation) linkCopy.destination += 1;
                return linkCopy;
              });
            }
            return relinkingPointsSameCellsAndCounts(oldCells, oldLinks, newCells);
          }));
      });
    });
  });

  describe('getRelatedCellsAndLinks', () => {
    const getRelatedCellsAndLinks = codeUnderTest.__getRelatedCellsAndLinks;
    context('The index param is negative', () => {
      it('An exception should be thrown with relevant information.', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat,
            (graphAndTargetInfo, randomNatural) => {
              try {
                getRelatedCellsAndLinks(
                  -1 * (randomNatural + 1),
                  graphAndTargetInfo.graph.cells,
                  graphAndTargetInfo.graph.links);
              } catch (error) {
                return error.message === 'Target index must be positive.';
              }
              return false;
            }), jsVerifyOptions);
      });
    });
    context('The index param is a number beyond the length of the cells param', () => {
      it('An exception should be thrown with relevant information.', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat,
            (graphAndTargetInfo, randomNatural) => {
              try {
                getRelatedCellsAndLinks(
                  graphAndTargetInfo.graph.cells.length + randomNatural + 1,
                  graphAndTargetInfo.graph.cells,
                  graphAndTargetInfo.graph.links);
              } catch (error) {
                return error.message === 'Target index must be less than the length of the cell list.';
              }
              return false;
            }), jsVerifyOptions);
      });
    });
    context('The index param is a number positive and less than the length of the cells param', () => {
      it('should return a graph with the cells from the parent graph that touch the targetCell', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), (graphAndTargetInfo) => {
            const result = getRelatedCellsAndLinks(
              graphAndTargetInfo.index,
              graphAndTargetInfo.graph.cells,
              graphAndTargetInfo.graph.links);
            /* If there are no cells then the index is NaN but, this would violate the basic type
             * preconditions of searchGraph so it is skipped.
             */
            if (isNaN(graphAndTargetInfo.index)) return true;
            const regularLinks =
              graphAndTargetInfo.targetRegLinkInfo.map(linkInfo => linkInfo.link);
            const joinLinks = graphAndTargetInfo.targetJoinInfo.map(linkInfo => linkInfo.linkWith);
            const testLinks = regularLinks.concat(joinLinks);
            const testCells = _.uniq(_.flatten(testLinks.map(link =>
              [graphAndTargetInfo.graph.cells[link.source],
                graphAndTargetInfo.graph.cells[link.destination]]))
              .concat([graphAndTargetInfo.graph.cells[graphAndTargetInfo.index]]));
            const resultCells = result.cells;
            return _.isEqual(
              _.sortBy(testCells, cell => cell.tableName),
              _.sortBy(resultCells, cell => cell.tableName));
          }), jsVerifyOptions);
      });
      it('should return a graph with the links from the parent graph that touch the targetCell', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), (graphAndTargetInfo) => {
            const result = getRelatedCellsAndLinks(
              graphAndTargetInfo.index,
              graphAndTargetInfo.graph.cells,
              graphAndTargetInfo.graph.links);
            const regularLinks =
              graphAndTargetInfo.targetRegLinkInfo.map(linkInfo => linkInfo.link);
            const joinLinks = graphAndTargetInfo.targetJoinInfo.map(linkInfo => linkInfo.linkWith);
            const testLinks = regularLinks.concat(joinLinks);
            const resultLinks = result.links;
            return _.isEqual(
              _.sortBy(testLinks, linkToString),
              _.sortBy(resultLinks, linkToString));
          }), jsVerifyOptions);
      });
    });
  });

  describe('getJoinedCellsAndLinksToJoin', () => {
    const getJoinedCellsAndLinksToJoin = codeUnderTest.__getJoinedCellsAndLinksToJoin;
    context('The index param is negative', () => {
      it('An exception should be thrown with relevant information.', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat,
            (graphAndTargetInfo, randomNatural) => {
              let linksWithTarget =
                graphAndTargetInfo.targetRegLinkInfo.map(dataObj => dataObj.link);
              linksWithTarget = linksWithTarget.concat(
                graphAndTargetInfo.targetJoinInfo.map(dataObj => dataObj.linkWith));
              try {
                getJoinedCellsAndLinksToJoin(
                  -1 * (randomNatural + 1),
                  linksWithTarget,
                  graphAndTargetInfo.graph.cells,
                  graphAndTargetInfo.graph.links);
              } catch (error) {
                return error.message === 'Target index must be positive.';
              }
              return false;
            }), jsVerifyOptions);
      });
    });
    context('The index param is a number beyond the length of the cells param', () => {
      it('An exception should be thrown with relevant information.', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), jsverify.nat,
            (graphAndTargetInfo, randomNatural) => {
              let linksWithTarget =
                graphAndTargetInfo.targetRegLinkInfo.map(dataObj => dataObj.link);
              linksWithTarget = linksWithTarget.concat(
                graphAndTargetInfo.targetJoinInfo.map(dataObj => dataObj.linkWith));
              try {
                getJoinedCellsAndLinksToJoin(
                  graphAndTargetInfo.graph.cells.length + randomNatural + 1,
                  linksWithTarget,
                  graphAndTargetInfo.graph.cells,
                  graphAndTargetInfo.graph.links);
              } catch (error) {
                return error.message === 'Target index must be less than the length of the all cells list.';
              }
              return false;
            }), jsVerifyOptions);
      });
    });
    context('The index param is a number positive and less than the length of the cells param', () => {
      it('should return cells that are joined with the target cell', () => {
        jsverify.assert(
          jsverify.forall(
            graphAndTargetInfoArbitraryWithCellCount(), (graphWithTargetIndex) => {
              const indicesJoinedToTarget =
                graphWithTargetIndex.targetJoinInfo.map(infoObj => infoObj.otherCellIndex);
              const cellsJoinedToTarget =
                indicesJoinedToTarget.map(index => graphWithTargetIndex.graph.cells[index]);
              let linksWithTarget =
                graphWithTargetIndex.targetRegLinkInfo.map(dataObj => dataObj.link);
              linksWithTarget = linksWithTarget.concat(
                graphWithTargetIndex.targetJoinInfo.map(dataObj => dataObj.linkWith));
              const testOutput = getJoinedCellsAndLinksToJoin(
                graphWithTargetIndex.index,
                linksWithTarget,
                graphWithTargetIndex.graph.cells,
                graphWithTargetIndex.graph.links);
              return _.isEqual(cellsJoinedToTarget, testOutput.cells);
            }), jsVerifyOptions);
      });
      it('should return the links between joining cells and the joined cell of joins with the target cell', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(), (graphWithTargetIndex) => {
            const joinLinksOfCellsJoinedToTarget =
              graphWithTargetIndex.targetJoinInfo.map(infoObj => infoObj.joinCellOtherCellLink);
            let linksWithTarget =
              graphWithTargetIndex.targetRegLinkInfo.map(dataObj => dataObj.link);
            linksWithTarget = linksWithTarget.concat(
              graphWithTargetIndex.targetJoinInfo.map(dataObj => dataObj.linkWith));
            const testOutput = getJoinedCellsAndLinksToJoin(
              graphWithTargetIndex.index,
              linksWithTarget,
              graphWithTargetIndex.graph.cells,
              graphWithTargetIndex.graph.links);
            return _.isEqual(joinLinksOfCellsJoinedToTarget, testOutput.links);
          }), jsVerifyOptions);
      });
    });
  });

  describe('SearchGraph', () => {
    let errorNotifierStub;
    let generateGraphStub;
    const testContainer = {};

    // nonEmptyMetadataState cells and links are set up so the many-to-many relations
    // are diverse in terms of which link source and destination assignments. The
    // target cell serves as both a source and a destination for different join tables.
    const nonEmptyMetadataCells = [
      {
        id: 0,
        columns: ['address_id: int(11) PK', 'street: varchar(255)', 'city: varchar(255)', 'state: varchar(255)', 'country: varchar(255)', 'zip: varchar(255)'],
        tableName: 'address',
      }, {
        id: 1,
        columns: ['encounter_id: int(11) PK', 'encounter_type: varchar(255)'],
        tableName: 'encounter',
      }, {
        id: 2,
        columns: ['id: int(10) unsigned PK', 'name: varchar(255)', 'batch: int(11)', 'migration_time: timestamp'],
        tableName: 'knex_migrations',
      }, {
        id: 3,
        columns: ['is_locked: int(11)'],
        tableName: 'knex_migrations_lock',
      }, {
        id: 4,
        columns: ['person_id: int(11) PK', 'name_first: varchar(255)', 'name_last: varchar(255)'],
        tableName: 'person',
      }, {
        id: 5,
        columns: ['person_address_id: int(11) PK', 'address_id: int(11)', 'person_id: int(11)'],
        tableName: 'person_address',
      }, {
        id: 6,
        columns: ['person_encounter_id: int(11) PK', 'encounter_id: int(11)', 'person_id: int(11)'],
        tableName: 'person_encounter',
      }];
    const nonEmptyMetadataLinks = [
      {
        source: 0,
        destination: 5,
        destinationRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        sourceRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }, {
        source: 4,
        destination: 5,
        destinationRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        sourceRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }, {
        source: 6,
        destination: 1,
        sourceRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }, {
        source: 6,
        destination: 4,
        sourceRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }];
    const nonEmptyMetadataTableNames = ['address', 'encounter', 'knex_migrations',
      'knex_migrations_lock', 'person', 'person_address', 'person_encounter'];

    const nonEmptyMetadataState = {
      cells: nonEmptyMetadataCells,
      links: nonEmptyMetadataLinks,
      tableNames: nonEmptyMetadataTableNames,
    };

    const emptyMetadataState = {
      cells: [],
      links: [],
      tableNames: [],
    };

    beforeEach(() => {
      errorNotifierStub = sinon.stub(errorNotifier, 'alertError');
      generateGraphStub = sinon.stub(generateGraph, 'generateGraph');
    });

    afterEach(() => {
      errorNotifierStub.restore();
      generateGraphStub.restore();
    });

    context('when no cells\' titles contain the searchCriteria string', () => {
      it('should notify with an invalid search criteria error', () => {
        codeUnderTest.searchGraph(testContainer, 'qzwert', nonEmptyMetadataState);
        sinon.assert.calledOnce(errorNotifierStub);
        sinon.assert.calledWithMatch(errorNotifierStub,
          { message: errorMessages.INVALID_SEARCH_CRITERIA });
      });
    });

    context('when metadatastate has no cells or links', () => {
      it('should notify with an invalid search criteria error', () => {
        codeUnderTest.searchGraph(testContainer, 'person', emptyMetadataState);
        sinon.assert.calledOnce(errorNotifierStub);
        sinon.assert.calledWithMatch(errorNotifierStub,
          { message: errorMessages.INVALID_SEARCH_CRITERIA });
      });
    });

    context('when metadataState\'s graph has no links, a cell with a matching title to\
      the query string, and other cells', () => {
      it('should call network generator with just the cell with a matching title', () => {
        codeUnderTest.searchGraph(testContainer, 'person', {
          links: [],
          cells: nonEmptyMetadataCells,
          tableNames: nonEmptyMetadataTableNames,
        });

        const expectedCells = [
          {
            id: 4,
            columns: ['person_id: int(11) PK', 'name_first: varchar(255)', 'name_last: varchar(255)'],
            tableName: 'person',
          },
        ];

        sinon.assert.calledOnce(generateGraphStub);
        sinon.assert.calledWith(generateGraphStub, expectedCells, [], testContainer);
      });
      it('should not call the error notifier\'s alert error function', () => {
        sinon.assert.notCalled(errorNotifierStub);
      });
    });

    context('when the application metadata state has a graph with a cell with a title matching\
    the searchCriteria string, cells directly connected to that cell including through joins', () => {
      const expectedLinks = [{
        source: 0,
        destination: 1,
        sourceRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
      }, {
        source: 2,
        destination: 0,
        sourceRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }, {
        source: 3,
        destination: 1,
        sourceRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
      }, {
        source: 2,
        destination: 4,
        sourceRelationshipType: {
          name: 'MANY',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
        },
        destinationRelationshipType: {
          name: 'ONE',
          stroke: 'black',
          fill: 'transparent',
          d: 'M 10 0 L 10 20 M 10 10 L 0 10',
        },
      }];

      const expectedCells = [
        {
          id: 4,
          columns: ['person_id: int(11) PK', 'name_first: varchar(255)', 'name_last: varchar(255)'],
          tableName: 'person',
        }, {
          id: 5,
          columns: ['person_address_id: int(11) PK', 'address_id: int(11)', 'person_id: int(11)'],
          tableName: 'person_address',
        }, {
          id: 6,
          columns: ['person_encounter_id: int(11) PK', 'encounter_id: int(11)', 'person_id: int(11)'],
          tableName: 'person_encounter',
        }, {
          id: 0,
          columns: ['address_id: int(11) PK', 'street: varchar(255)', 'city: varchar(255)', 'state: varchar(255)',
            'country: varchar(255)', 'zip: varchar(255)'],
          tableName: 'address',
        }, {
          id: 1,
          columns: ['encounter_id: int(11) PK', 'encounter_type: varchar(255)'],
          tableName: 'encounter',
        }];

      beforeEach(() => {
        codeUnderTest.searchGraph(testContainer, 'person', nonEmptyMetadataState);
      });

      it('should call the network generator with the target cell, links & cells \
      directly connected to the target cell, and cells and links that are involved \
      in many-to-many joins with the target cell', () => {
        sinon.assert.calledOnce(generateGraphStub);
        sinon.assert.calledWith(generateGraphStub, expectedCells, expectedLinks, testContainer);
      });
      it('should not call the error notifier\'s alert error function', () => {
        sinon.assert.notCalled(errorNotifierStub);
      });
    });

    context('when the app metadata state has a graph with one cell and a title matching the searchCriteria', () => {
      it('should return all the cells linked, directly and through joins, to the matching cell and the matching cell', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(1), (graphWithTargetIndex) => {
            generateGraphStub.restore();
            generateGraphStub = sinon.stub(generateGraph, 'generateGraph');
            let expectedCells;
            let expectedCellsIndices =
              graphWithTargetIndex.targetRegLinkInfo.map(dataObj => (dataObj.otherCell));
            expectedCellsIndices = expectedCellsIndices.concat(
              graphWithTargetIndex.targetJoinInfo.map(dataObj => dataObj.otherCellIndex));

            expectedCells =
              _.uniq(expectedCellsIndices.map(i => graphWithTargetIndex.graph.cells[i]));
            expectedCells.push(graphWithTargetIndex.graph.cells[graphWithTargetIndex.index]);
            expectedCells = expectedCells.concat(
              graphWithTargetIndex.targetJoinInfo.map(dataObj => dataObj.joinCell));
            expectedCells = _.uniq(expectedCells);

            const targetName =
              graphWithTargetIndex.graph.cells[graphWithTargetIndex.index].tableName;
            codeUnderTest.searchGraph(testContainer, targetName, graphWithTargetIndex.graph);
            const cellsArgToGenerateGraph = generateGraphStub.args[0][0];
            return _.isEqual(
              _.sortBy(cellsArgToGenerateGraph, cell => cell.tableName),
              _.sortBy(expectedCells, cell => cell.tableName));
          }),
          jsVerifyOptions);
      });
      it('should return all the links linking the cells linked, directly and through joins to the matching cell', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(1), (graphAndTargetInfo) => {
            generateGraphStub.restore();
            generateGraphStub = sinon.stub(generateGraph, 'generateGraph');
            const joinLinksOfCellsJoinedToTarget =
              graphAndTargetInfo.targetJoinInfo.map(infoObj => infoObj.joinCellOtherCellLink);
            const regularLinks =
              graphAndTargetInfo.targetRegLinkInfo.map(linkInfo => linkInfo.link);
            const joinLinks = graphAndTargetInfo.targetJoinInfo.map(linkInfo => linkInfo.linkWith);
            const expectedLinks =
              joinLinksOfCellsJoinedToTarget.concat(regularLinks.concat(joinLinks));
            const targetName =
              graphAndTargetInfo.graph.cells[graphAndTargetInfo.index].tableName;
            codeUnderTest.searchGraph(testContainer, targetName, graphAndTargetInfo.graph);
            const linksArgToGenerateGraph = generateGraphStub.args[0][1];
            const cellsArgToGenerateGraph = generateGraphStub.args[0][0];
            const relinkedExpectedLinks = codeUnderTest.__relinkLinks(
              expectedLinks, graphAndTargetInfo.graph.cells, cellsArgToGenerateGraph);
            return _.isEqual(
              _.sortBy(linksArgToGenerateGraph, linkToString),
              _.sortBy(relinkedExpectedLinks, linkToString));
          }),
          jsVerifyOptions);
      });
      it('should not call the error notifier\'s alert error function', () => {
        jsverify.assert(
          jsverify.forall(graphAndTargetInfoArbitraryWithCellCount(1), (graphAndTargetInfo) => {
            errorNotifierStub.restore();
            errorNotifierStub = sinon.stub(errorNotifierStub, 'generateGraph');
            const targetName =
              graphAndTargetInfo.graph.cells[graphAndTargetInfo.index].tableName;
            codeUnderTest.searchGraph(testContainer, targetName, graphAndTargetInfo.graph);
            return errorNotifierStub.notCalled;
          }),
          jsVerifyOptions);
      });
    });
  });
});
