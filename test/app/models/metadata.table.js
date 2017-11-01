/**
 * Created by TA053139 on 3/23/2017.
 */

const TableMetadata = require('../../../app/models/metadata.table');
const ColumnMetadata = require('../../../app/models/metadata.column');
const chai = require('chai');

const expect = chai.expect;

describe('TableMetadata', () => {
  it('should load', () => {
    expect(TableMetadata).to.be.a('function');
  });

  describe('Constructor and default values', () => {
    it('should have the same corresponding table name value' +
      ' passed to the constructor',
      () => {
        const tableName = 'aName';
        const table = new TableMetadata(tableName);

        expect(table.name).to.be.equal(tableName);
      });

    it('should have the columns field as an empty array',
      () => {
        const tableName = 'aName';
        const table = new TableMetadata(tableName);
        // Eslint consider the following line as an expression although it is a function call.
        // eslint-disable-next-line no-unused-expressions
        expect(table.columns).to.be.empty;
      });
  });

  describe('#addColumn()',
    () => {
      it('should have one column length when a column is added using addColumn()' +
        ' function to the TableMetadata object',
        () => {
          const myTable = new TableMetadata('myTable');
          myTable.addColumn(new ColumnMetadata('myColumn', 'myColumnType'));
          expect(myTable.columns.length).to.equal(1);
        });

      it('should maintain the same passed column\'s name',
        () => {
          const myTable = new TableMetadata('myTable');
          const column = new ColumnMetadata('myColumn', 'myColumnType');
          myTable.addColumn(column);
          expect(myTable.columns[0].name).to.equal(column.name);
        });

      it('should maintain the same passed column\'s type',
        () => {
          const myTable = new TableMetadata('myTable');
          const column = new ColumnMetadata('myColumn', 'myColumnType');
          myTable.addColumn(column);
          expect(myTable.columns[0].type).to.equal(column.type);
        });

      it('should maintain the same passed column\'s isPK',
        () => {
          const myTable = new TableMetadata('myTable');
          const column = new ColumnMetadata('myColumn', 'myColumnType');
          myTable.addColumn(column);
          expect(myTable.columns[0].isPK).to.equal(column.isPK);
        });

      it('should maintain the same passed column\'s referenceTable',
        () => {
          const myTable = new TableMetadata('myTable');
          const column = new ColumnMetadata('myColumn', 'myColumnType');
          myTable.addColumn(column);
          expect(myTable.columns[0].referenceTable).to.equal(column.referenceTable);
        });

      it('should maintain the same passed column\'s referenceColumn',
        () => {
          const myTable = new TableMetadata('myTable');
          const column = new ColumnMetadata('myColumn', 'myColumnType');
          myTable.addColumn(column);
          expect(myTable.columns[0].referenceColumn).to.equal(column.referenceColumn);
        });
    });

  describe('#addColumnByNameAndType()', () => {
    it('should have one column length when a column is added using addColumnByNameAndType()' +
      ' function to the TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('myColumn', 'myColumnType');
        expect(myTable.columns.length).to.equal(1);
      });

    it('should maintain the same passed column\'s name',
      () => {
        const myTable = new TableMetadata('myTable');
        const columnName = 'myColumnName';
        const columnType = 'myColumnType';
        myTable.addColumnByNameAndType(columnName, columnType);
        expect(myTable.columns[0].name).to.equal(columnName);
      });

    it('should maintain the same passed column\'s type',
      () => {
        const myTable = new TableMetadata('myTable');
        const columnName = 'myColumnName';
        const columnType = 'myColumnType';
        myTable.addColumnByNameAndType(columnName, columnType);
        expect(myTable.columns[0].type).to.equal(columnType);
      });

    it('should maintain the default value for column\'s isPK',
      () => {
        const myTable = new TableMetadata('myTable');
        const columnName = 'myColumnName';
        const columnType = 'myColumnType';
        myTable.addColumnByNameAndType(columnName, columnType);
        expect(myTable.columns[0].isPK).to.equal(false);
      });

    it('should maintain the default value for column\'s referencedTable',
      () => {
        const myTable = new TableMetadata('myTable');
        const columnName = 'myColumnName';
        const columnType = 'myColumnType';
        myTable.addColumnByNameAndType(columnName, columnType);
        expect(myTable.columns[0].referenceTable).to.equal('');
      });

    it('should maintain the default value for column\'s referencedColumn',
      () => {
        const myTable = new TableMetadata('myTable');
        const columnName = 'myColumnName';
        const columnType = 'myColumnType';
        myTable.addColumnByNameAndType(columnName, columnType);
        expect(myTable.columns[0].referenceColumn).to.equal('');
      });
  });

  describe('#getPrimaryKeyColumns()', () => {
    it('should list one primary key column after adding' +
      ' one primary key column using addColumn() function to the TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        const column = new ColumnMetadata('anyName', 'anyType');
        column.isPK = true;
        column.referenceTable = '';
        myTable.addColumn(column);
        expect(myTable.getPrimaryKeyColumns().length).to.equal(1);
      });

    it('should list zero primary keys after adding' +
      ' one non-primary key column to the TableMetadata object using addColumn() function',
      () => {
        const myTable = new TableMetadata('myTable');
        const column = new ColumnMetadata('anyName', 'anyType');
        column.isPK = false;
        column.type = 'String';

        myTable.addColumn(column);
        expect(myTable.getPrimaryKeyColumns().length).to.equal(0);
      });

    it('should list zero primary keys after the TableMetadata' +
      ' object is just initiated',
      () => {
        const myTable = new TableMetadata('aTable');
        expect(myTable.getPrimaryKeyColumns().length).to.equal(0);
      });

    const COUNT = 5;
    it(`should list zero primary keys after adding ${COUNT}\
 non-primary key columns to the TableMetadata`,
      () => {
        const myTable = new TableMetadata('aTable');

        for (let i = 1; i <= COUNT; i += 1) {
          const col = new ColumnMetadata(`column_${i}`, `type_${i}`);
          col.isPK = false;
          myTable.addColumn(col);
        }

        expect(myTable.getPrimaryKeyColumns().length).to.equal(0);
      });

    const PK_COUNT = 2;
    const NON_PK_COUNT = 5;
    it(`should list primary keys after adding ${NON_PK_COUNT}\
 non-primary key columns and ${PK_COUNT}\
 primary keys to the TableMetadata`,
      () => {
        const myTable = new TableMetadata('aTable');

        // add non primary key fields
        for (let i = 1; i <= NON_PK_COUNT; i += 1) {
          const col = new ColumnMetadata(`column_${i}`, `type_${i}`);
          col.isPK = false;
          myTable.addColumn(col);
        }

        // add primary key fields
        for (let j = 1; j <= PK_COUNT; j += 1) {
          const col = new ColumnMetadata(`pk_column_${j}`, `type_${j}`);
          col.isPK = true;
          myTable.addColumn(col);
        }

        expect(myTable.getPrimaryKeyColumns().length).to.equal(PK_COUNT);
      });
  });

  describe('#getColumnIndexByName()', () => {
    it('should return -1 when invoking getColumnIndexByName() after' +
      ' having TableMetadata object just initialized',
      () => {
        const myTable = new TableMetadata('myTable');

        expect(myTable.getColumnIndexByName('koko')).to.equal(-1);
      });

    it('should return -1 when invoking getColumnIndexByName()' +
      ' on a non-existing column of a TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('Column1', 'Column1Type');
        myTable.addColumnByNameAndType('Column2', 'Column2Type');
        expect(myTable.getColumnIndexByName('Column3.14')).to.equal(-1);
      });

    it('should return a positive value when invoking getColumnIndexByName()' +
      ' on an already existing column of a TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('Column1', 'Column1Type');
        myTable.addColumnByNameAndType('Column2', 'Column2Type');

        // The index should be >= 0
        expect(myTable.getColumnIndexByName('Column1')).to.be.at.least(0);
      });

    it('should return the index to the actual corresponding value' +
      ' when invoking getColumnIndexByName()' +
      ' on an already existing column of a TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('Column1', 'Column1Type');
        myTable.addColumnByNameAndType('Column2', 'Column2Type');

        // The index should be >= 0
        const idx = myTable.getColumnIndexByName('Column1');
        expect(myTable.columns[idx].name).to.be.equal('Column1');
      });
  });

  describe('#getColumnByName()', () => {
    it('should return "null" when invoking getColumnByName()' +
      ' after having TableMetadata object just initialized',
      () => {
        const myTable = new TableMetadata('myTable');
        // Eslint consider the following line as an expression although it is a function call.
        // eslint-disable-next-line no-unused-expressions
        expect(myTable.getColumnByName('Column2.7')).to.be.null;
      });

    it('should return "null" when invoking getColumnByName()' +
      ' on a non-existing column of a TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('Column1', 'Column1Type');
        myTable.addColumnByNameAndType('Column2', 'Column2Type');
        // Eslint consider the following line as an expression although it is a function call.
        // eslint-disable-next-line no-unused-expressions
        expect(myTable.getColumnByName('Column3.14')).to.be.null;
      });

    it('should return the actual corresponding value when invoking getColumnByName()' +
      ' on an already existing column of a TableMetadata object',
      () => {
        const myTable = new TableMetadata('myTable');
        myTable.addColumnByNameAndType('Column1', 'Column1Type');
        myTable.addColumnByNameAndType('Column2', 'Column2Type');

        const col = myTable.getColumnByName('Column1');
        expect(col.name).to.equal('Column1');
      });
  });
});
