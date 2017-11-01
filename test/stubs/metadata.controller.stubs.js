exports.oneTableStubs = {};
exports.databaseStubs = {};

exports.oneTableStubs.PK_TABLE = {
  tableName: 'employee',
  databaseResultSet: [
    {
      COLUMN_NAME: 'emp_no',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      COLUMN_NAME: 'first_name',
      COLUMN_TYPE: 'VARCHAR(14)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      COLUMN_NAME: 'last_name',
      COLUMN_TYPE: 'VARCHAR(16)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
  ],
  expectedOutcome:
  {
    name: 'employee',
    columns: [{
      name: 'emp_no',
      type: 'INT(11)',
      isPK: true,
      referenceTable: '',
      referenceColumn: '',
    },
    {
      name: 'first_name',
      type: 'VARCHAR(14)',
      isPK: false,
      referenceTable: '',
      referenceColumn: '',
    },
    {
      name: 'last_name',
      type: 'VARCHAR(16)',
      isPK: false,
      referenceTable: '',
      referenceColumn: '',
    },
    ],
  },
};

exports.oneTableStubs.PK_AND_FK_TABLE = {
  tableName: 'dept_manager',
  databaseResultSet: [
    {
      COLUMN_NAME: 'emp_no',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      COLUMN_NAME: 'dept_no',
      COLUMN_TYPE: 'CHAR(4)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    }, {
      COLUMN_NAME: 'emp_no',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'FOREIGN KEY',
      REFERENCED_TABLE_NAME: 'pkTable',
      REFERENCED_COLUMN_NAME: 'emp_no',
    },
    {
      COLUMN_NAME: 'dept_no',
      COLUMN_TYPE: 'CHAR(4)',
      CONSTRAINT_TYPE: 'FOREIGN KEY',
      REFERENCED_TABLE_NAME: 'departments',
      REFERENCED_COLUMN_NAME: 'dept_no',
    },
    {
      COLUMN_NAME: 'from_date',
      COLUMN_TYPE: 'DATE',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      COLUMN_NAME: 'to_date',
      COLUMN_TYPE: 'DATE',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
  ],
  expectedOutcome:
  {
    name: 'dept_manager',
    columns: [
      {
        name: 'emp_no',
        type: 'INT(11)',
        isPK: true,
        referenceTable: 'pkTable',
        referenceColumn: 'emp_no',
      },
      {
        name: 'dept_no',
        type: 'CHAR(4)',
        isPK: true,
        referenceTable: 'departments',
        referenceColumn: 'dept_no',
      },
      {
        name: 'from_date',
        type: 'DATE',
        isPK: false,
        referenceTable: '',
        referenceColumn: '',
      },
      {
        name: 'to_date',
        type: 'DATE',
        isPK: false,
        referenceTable: '',
        referenceColumn: '',
      },
    ],
  },
};

exports.oneTableStubs.ORPHAN_TABLE = {
  tableName: 'orphan',
  databaseResultSet: [
    {
      COLUMN_NAME: 'orphan_no',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      COLUMN_NAME: 'orphan_name',
      COLUMN_TYPE: 'VARCHAR(14)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
  ],
  expectedOutcome:
  {
    name: 'orphan',
    columns: [{
      name: 'orphan_no',
      type: 'INT(11)',
      isPK: false,
      referenceTable: '',
      referenceColumn: '',
    },
    {
      name: 'orphan_name',
      type: 'VARCHAR(14)',
      isPK: false,
      referenceTable: '',
      referenceColumn: '',
    },
    ],
  },
};

exports.oneTableStubs.EMPTY_RESULTS = {
  tableName: 'empty',
  databaseResultSet: [],
  expectedOutcome: [],
};

exports.databaseStubs.ONE_RESULT = {
  databaseResultSet: [{
    TABLE_NAME: 'orphan_table',
    COLUMN_NAME: 'orphan_no',
    COLUMN_TYPE: 'INT(11)',
    CONSTRAINT_TYPE: '',
    REFERENCED_TABLE_NAME: '',
    REFERENCED_COLUMN_NAME: '',
  }],
  expectedOutcome: [
    {
      name: 'orphan_table',
      columns: [
        {
          name: 'orphan_no',
          type: 'INT(11)',
          isPK: false,
          referenceTable: '',
          referenceColumn: '',
        },
      ],
    },
  ],
};

exports.databaseStubs.ONE_TO_MANY = {
  databaseResultSet: [
    {
      TABLE_NAME: 'person',
      COLUMN_NAME: 'id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'person',
      COLUMN_NAME: 'name',
      COLUMN_TYPE: 'VARCHAR(32)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'car',
      COLUMN_NAME: 'id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'car',
      COLUMN_NAME: 'model',
      COLUMN_TYPE: 'VARCHAR(20)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'car',
      COLUMN_NAME: 'owner',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'FOREIGN KEY',
      REFERENCED_TABLE_NAME: 'person',
      REFERENCED_COLUMN_NAME: 'id',
    },
  ],
  expectedOutcome:
  [
    {
      name: 'person',
      columns: [
        {
          name: 'id',
          type: 'INT(11)',
          isPK: true,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'name',
          type: 'VARCHAR(32)',
          isPK: false,
          referenceTable: '',
          referenceColumn: '',
        },
      ],
    },
    {
      name: 'car',
      columns: [
        {
          name: 'id',
          type: 'INT(11)',
          isPK: true,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'model',
          type: 'VARCHAR(20)',
          isPK: false,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'owner',
          type: 'INT(11)',
          isPK: false,
          referenceTable: 'person',
          referenceColumn: 'id',
        },
      ],
    },
  ],
};

exports.databaseStubs.ONE_TO_ONE = {
  databaseResultSet: [
    {
      TABLE_NAME: 'person',
      COLUMN_NAME: 'id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'person',
      COLUMN_NAME: 'name',
      COLUMN_TYPE: 'VARCHAR(32)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'person',
      COLUMN_NAME: 'address_id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'FOREIGN KEY',
      REFERENCED_TABLE_NAME: 'address',
      REFERENCED_COLUMN_NAME: 'id',
    },
    {
      TABLE_NAME: 'address',
      COLUMN_NAME: 'id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'PRIMARY KEY',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'address',
      COLUMN_NAME: 'city',
      COLUMN_TYPE: 'VARCHAR(20)',
      CONSTRAINT_TYPE: '',
      REFERENCED_TABLE_NAME: '',
      REFERENCED_COLUMN_NAME: '',
    },
    {
      TABLE_NAME: 'address',
      COLUMN_NAME: 'person_id',
      COLUMN_TYPE: 'INT(11)',
      CONSTRAINT_TYPE: 'FOREIGN KEY',
      REFERENCED_TABLE_NAME: 'person',
      REFERENCED_COLUMN_NAME: 'id',
    },
  ],
  expectedOutcome: [
    {
      name: 'person',
      columns: [
        {
          name: 'id',
          type: 'INT(11)',
          isPK: true,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'name',
          type: 'VARCHAR(32)',
          isPK: false,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'address_id',
          type: 'INT(11)',
          isPK: false,
          referenceTable: 'address',
          referenceColumn: 'id',
        },
      ],
    },
    {
      name: 'address',
      columns: [
        {
          name: 'id',
          type: 'INT(11)',
          isPK: true,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'city',
          type: 'VARCHAR(20)',
          isPK: false,
          referenceTable: '',
          referenceColumn: '',
        },
        {
          name: 'person_id',
          type: 'INT(11)',
          isPK: false,
          referenceTable: 'person',
          referenceColumn: 'id',
        },
      ],
    },
  ],
};

exports.databaseStubs.EMPTY_RESULTS = {
  databaseResultSet: [],
  expectedOutcome: [],
};
