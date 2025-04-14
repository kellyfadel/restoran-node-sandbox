// Import DataTypes from Sequelize
const {DataTypes} = require('sequelize');

// Define a model that represents a contact request

//Import sequelize instance
const sequelize = require('../../util/sequelize/database');

// Use sequelize.define to create a new model
const Contact = sequelize.define('contact', {
    // Define the attributes of a contact request
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNulls: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            // Name must be at least one character
            len: {
                args: [1],
                msg: "Name must be at least one letter."
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { 
            // Email must be a valid email address
           isEmail: {
           args: true,
           msg: "Please enter a valid email address."
           },
           // Email must end in .com or .net
           is: {
               args: /.+\.(com|net)$/i ,
               msg: "Please use an email address ending in .com or .net"
           }            
       }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    responseDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
},{
    tableName: 'contacts',
    underscored: true
});

module.exports = Contact;