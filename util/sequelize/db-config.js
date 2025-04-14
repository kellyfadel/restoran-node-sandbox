const sequelize = require("./database");

const Contact = require("../../models/sequelize/contact-model");
const MenuCategory = require("../../models/sequelize/menu-category-model");
const MenuItem = require("../../models/sequelize/menu-item-model");
const Employee = require('../../models/sequelize/employee-model');

// // Import database data
const catData = require("./menu_categories.json");
const itemData = require("./menu_items.json");
const employeeData = require('./employees.json')

exports.setModelRelationships = () => {
  // Define relationship between MenuCategory and MenuItem
  const catItemForeignKeyConfig = {
    foreignKey: {
      name: "cat_id",
      allowNull: false,
    },
  };

  MenuCategory.hasMany(MenuItem, catItemForeignKeyConfig);
  MenuItem.belongsTo(MenuCategory, catItemForeignKeyConfig);
};

exports.populateData = () => {
  // Sync models to database
  sequelize
    .sync({force:true})
    .then((result) => {
      console.log("SUCCESS! ", result);
    })
    // Bulk insert categories
    .then(() => {
      return MenuCategory.bulkCreate(catData);
    })
    .then((catResult) => {
      console.log("Cat result: ", catResult);
      return MenuItem.bulkCreate(itemData);
    })
    .then((itemResult) => {
      console.log("Item Result: ", itemResult);
    })
    .then(() => {
        return Employee.bulkCreate(employeeData);
    })
    .then((employeeResult) => {
        console.log("Employee Results: ", employeeResult);
    })
    .catch((err) => {
      console.log("Error!  ", err);
    });
};
