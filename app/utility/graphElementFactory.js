/**
 * Creates and returns new jointJs objects
 */

const jointjs = require('jointjs');
const defaultCellAttrs = require('../../app/utility/defaultCellAttrs').defaultCellAttrs;
const defaultLinkAttrs = require('../../app/utility/defaultLinkAttrs').defaultLinkAttrs;

const PaperPanner = require('../../app/plugins/PaperPanner').PaperPanner;
const PaperZoomer = require('../../app/plugins/PaperZoomer').PaperZoomer;

/**
 * @function createJointJsCell - Creates and turns a jointJs uml cell to represent a table
 * @param {Object} cell - Cell object to create jointJs uml Cell from
 * @param {Object} position - Optional position; must be in jointJs position attribute format
 * @param {Object} size - Optional size; must be in jointJs size attribute format
 * @returns {Object} - Returns a jointJSCell that was created from the input parameters
 */
module.exports.createJointJsCell = (cell, position, size) => {
  let jointJSCell;
  if (cell !== undefined && cell !== null) {
    jointJSCell = new jointjs.shapes.uml.Class({
      position: (position !== undefined) ? position : defaultCellAttrs.rectanglePosition,
      size: (size !== undefined) ? size : defaultCellAttrs.rectangleSize,
      name: cell.tableName,
      attributes: cell.columns,
      attrs: {
        '.uml-class-name-rect': defaultCellAttrs.rectangleHeaderAttributes,
        '.uml-class-attrs-rect': defaultCellAttrs.rectangleBodyAttributes,
        '.uml-class-methods-rect': defaultCellAttrs.rectangleMethodsAttributes,
        '.uml-class-attrs-text': defaultCellAttrs.textAttributes,
        '.uml-class-name-text': defaultCellAttrs.nameAttributes,
        '.uml-class-name-rect, .uml-class-attrs-rect, .uml-class-name-text, .uml-class-attrs-text':
          defaultCellAttrs.cursorAttributes,
      },
      z: defaultCellAttrs.z,
    });

    /*
     * Automatic resizing of rectangles
     * Only if width or height is set to 'auto'
     * Width and height will be replaced with calculated width and height
     */
    const padding = defaultCellAttrs.resizingAttributes.padding;
    // After resizing, cells appeared twice as large as they should be
    const scale = defaultCellAttrs.resizingAttributes.scale;
    const fontSize = jointJSCell.attributes.attrs['.uml-class-name-text']['font-size'];

    if (jointJSCell.attributes.size.width === 'auto') {
      let maxLength = 0;
      // Find the longest attribute string
      cell.columns.forEach((attribute) => {
        if (attribute.length > maxLength) {
          maxLength = attribute.length;
        }
      });

      // Replace maxLength with length of table name, if greater than or equal
      if (cell.tableName.length >= maxLength) {
        // Add 2 to compensate for bolded text
        maxLength = cell.tableName.length + 2;
      }

      jointJSCell.attributes.size.width = (maxLength * fontSize * scale) + padding;
    }

    if (jointJSCell.attributes.size.height === 'auto') {
      jointJSCell.attributes.size.height = (
          (cell.columns.length + 2) * fontSize
        ) + (padding * 3);
    }
  } else {
    throw new TypeError('Given cell is undefined or null');
  }
  return jointJSCell;
};

/**
 * @function createJointJsLink - Creates and returns a jointJs link to represent a relationship
 * @param link: Link object to create jointJs link from
 * @returns {Object} - Returns a jointJSLink that was created from the input parameters
 */
module.exports.createJointJsLink = (link) => {
  let jointJSLink;
  if (link !== null && link !== undefined) {
    jointJSLink = new jointjs.dia.Link({
      source: {
        id: link.source,
      },
      target: {
        id: link.destination,
      },
      attrs: {
        // other attributes
        '.link-tools': defaultLinkAttrs.linkToolAttributes,
        '.connection': defaultLinkAttrs.connectionAttributes,
        '.connection-wrap': defaultLinkAttrs.connectionWrapAttributes,
        '.marker-arrowheads': defaultLinkAttrs.markerArrowheadAttributes,
        '.marker-source': link.sourceRelationshipType,
        '.marker-target': link.destinationRelationshipType,
      },
      z: defaultLinkAttrs.z,
    });
  } else {
    throw new TypeError('Given link is undefined or null');
  }
  /* Sets the routing method to manhattan, which, instead of drawing a straight line from source
   * to destination, draws only horizontal and vertical lines */
  jointJSLink.set('router', { name: 'manhattan' });
  return jointJSLink;
};

/**
 * @function createJointJsGraph - Creates and returns a jointJs Graph object
 * @returns {Object} Returns a jointJSGraph
 */
module.exports.createJointJsGraph = () => new jointjs.dia.Graph();

/**
 * @function createJointJsPaper - Creates and returns a new jointJs Paper object
 * @param {Graph} graph: The graph to associate with the paper
 * @param {Object} container: The container where the paper should create a drawable space
 * @returns {Object} - Returns a jointJs Paper object
 */
module.exports.createJointJsPaper = (graph, container) => {
  let jointJSPaper;
  if (graph !== undefined && graph !== null && container !== undefined && container !== null) {
    jointJSPaper = new jointjs.dia.Paper({
      el: container,
      width: container.width,
      height: container.height,
      gridSize: 1,
      model: graph,
      interactive: (cellView) => {
        if (cellView.model instanceof jointjs.dia.Link) {
          /* Disable the default vertex add functionality on pointerdown.
           * The ability to add vertexes and modify the links between tables is not necessary for
           *  this visualizer, and does not look appealing in its current state. */
          return { vertexAdd: false };
        }
        return true;
      },
    });
  } else {
    throw new TypeError('Given graph or container is undefined or null');
  }
  return jointJSPaper;
};

/**
 * @function createJointJsPaperPanner - Creates and returns a new PaperPanner object
 * @param {Paper} paper: The jointJs paper to associate with the panner
 * @param {Object} - Returns a PaperPanner object
 */
module.exports.createJointJsPaperPanner = (paper) => {
  if (paper === undefined || paper === null) {
    throw new Error('Given paper is undefined or null');
  }
  return new PaperPanner(paper);
};

module.exports.createJointJsPaperZoomer = (paper) => {
  if (paper === undefined || paper === null) {
    throw new Error('Given paper is undefined or null');
  }
  return new PaperZoomer(paper);
};
