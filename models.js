const sequelize = require('./connect');
const { DataTypes } = require('sequelize');

const Entries = sequelize.define('entries', {
  id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
  user_name: {type: DataTypes.CHAR, primaryKey: false, unique: false, autoIncrement: false},
  user_tel: {type: DataTypes.CHAR, primaryKey: false, unique: false, autoIncrement: false},
  entry_day: {type: DataTypes.CHAR, primaryKey: false, unique: false, autoIncrement: false},
  entry_time: {type: DataTypes.CHAR, primaryKey: false, unique: false, autoIncrement: false},
})


module.exports = Entries;