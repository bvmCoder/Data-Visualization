/**
 * Description - Takes a table and formats the data into an array of columns
 * (represented as strings) to be visualized on a cell.
 * @param {object} table - a tableMetadata object
 * @returns {string[]} formattedColumns - an array of strings representing each columns information
 */
module.exports.formatColumns = (table) => {
  // Go through each column and put it in the array
  const formattedColumns = table.columns.reduce((formattedColumnList, column) => {
    // eslint-disable-next-line prefer-template
    let columnString = column.name + ': ' + column.type; // Create the column string

    // If the column is a primary key, append a PK label to the column description
    if (column.isPK) {
      columnString += ' PK';
    }

    // Add the column string to the list of columns
    formattedColumnList.push(columnString);
    return formattedColumnList;
  }, []);

  // Return all of the formatted column strings
  return formattedColumns;
};
