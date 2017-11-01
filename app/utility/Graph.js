const GraphCell = require('./Cell').Cell;
const GraphLink = require('./Link').Link;
const formatColumns = require('./columnFormatter').formatColumns;
const ErrorMessages = require('./messages').ErrorMessages;
const connectionTypes = require('./linkConnectionTypes').connectionTypes;

/**
  * @class Graph - creates a Graph class containing cells and links
  */
class Graph {
  /**
    * A constructor for a graph consisting of cells and links
    * @param tables: a JSON object of TableMetaData objects
    * @constructor: sets cells and links
    */
  constructor(tables) {
    this.cells = [];
    this.links = [];
    this.populate(tables);
  }

  populate(tables) {
    this.cells = this.generateCells(tables);
    this.links = this.generateLinks(tables);
  }

  /**
    * Description:  generates a set of cells jointJS can visualize on the front end
    * @param tables: an array of of TableMetadata objects
    * @returns Array: an array of cells for jointJS to wrap
    */
  generateCells(tables) {
    // go through all the tables and make a cell for them
    // if a table cant be made return a single cell that says error

    if (tables.length === 0) {
      throw new Error(ErrorMessages.NO_TABLES_RETRIEVED);
    }
    if (tables.constructor !== Array) {
      throw new Error(ErrorMessages.INVALID_ARGUMENT_ARRAY_EXPECTED);
    }
    tables.forEach((table, tableId) => {
      // if the table does not have a name then something is wrong with the
      // TableMetadata and execution should halt
      if (table.name === '' || !('name' in table)) {
        this.cells = [];
        throw new Error(ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      }
      this.cells.push(new GraphCell(tableId, formatColumns(table), table.name));
    });

    return this.cells;
  }

  /**
    * Description: generates a set of links jointJS can visualize on the front end
    * @param tables: an array of TableMetaData objects
    * @returns Array: an array of links for jointJS to wrap
    */
  generateLinks(tables) {
    let sourceRelationshipType;
    const destinationRelationshipType = connectionTypes.ONE;
    // go through all the tables and create valid links
    // if the table that the link is trying to connect to is not in cells
    // then do not create the link
    tables.forEach((table, tableIndex) => {
      if (!table.name) {
        throw new Error(ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      }
      table.columns.forEach((column) => {
        if (!('referenceTable' in column)) {
          throw new Error(ErrorMessages.COLUMN_MUST_HAVE_REFERENCE_TABLE_PROPERTY);
        }

        // See if there is a relationship (foreign key)
        if (column.referenceTable) {
          /* If the foreign key is a primary key then the relationship is one to one,
          else the relationsihp is one-to-many (many-to-many relationsihps are represented
          with multiple one-to-many relationships */
          if (column.isPK) {
            sourceRelationshipType = connectionTypes.ONE;
          } else {
            sourceRelationshipType = connectionTypes.MANY;
          }
          // find the id of the table cell it is referencing
          this.cells.forEach((cell) => {
            if (cell.tableName === column.referenceTable) {
              this.links.push(
                new GraphLink(
                  tableIndex,
                  cell.id,
                  sourceRelationshipType,
                  destinationRelationshipType));
            }
          });
        }
      });
    });

    return this.links;
  }
}

// Export the Graph object
module.exports = Graph;
