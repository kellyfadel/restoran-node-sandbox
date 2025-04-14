const Sequelize = require('sequelize');


const sequelize = require('../../util/sequelize/database');


const Employee = sequelize.define('employee', {
    // Define attributes of an employee
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ephithet: {
        type: Sequelize.STRING,
        allowNull: true
    },
    image : {
        type: Sequelize.STRING,
        allowNull: false
    }
});


module.exports = Employee;