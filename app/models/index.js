
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/config');

const db = {};

const sequelize = new Sequelize(config.db);

// contains all files that are not intended to be sequelized
// We do not need to sequelize (ORM) our metadata model because it is not synced
//  with any table(s) on the actual database. It is just the db metadata information
//  that is going to be retrieved using different queries */
const EXCLUDED_FILES_LIST = ['index.js', 'metadata.table.js', 'metadata.column.js'];

fs.readdirSync(__dirname).filter(file =>
  (file.indexOf('.') !== 0) && !EXCLUDED_FILES_LIST.includes(file)).forEach((file) => {
    const model = sequelize.import((path.join(__dirname, file)));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
