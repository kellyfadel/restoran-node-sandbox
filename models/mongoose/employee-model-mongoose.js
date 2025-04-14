const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the employee schema
const employeeSchema = new Schema({
  firstName: {
    type: String,
    required: true, // equivalent to `allowNull: false` in Sequelize
  },
  lastName: {
    type: String,
    required: true, // equivalent to `allowNull: false` in Sequelize
  },
  title: {
    type: String,
    required: false, // equivalent to `allowNull: true` in Sequelize
  },
  byName: {
    type: String,
    required: false, // equivalent to `allowNull: true` in Sequelize
  },
  image: {
    type: String,
    required: true, // equivalent to `allowNull: false` in Sequelize
  },
}, {
  // Options
  collection: 'employees', // matches the `tableName` in Sequelize
  timestamps: false, // no `createdAt` and `updatedAt` fields by default (like `underscored: true` in Sequelize)
});

// Create and export the model
module.exports = mongoose.model('Employee', employeeSchema);