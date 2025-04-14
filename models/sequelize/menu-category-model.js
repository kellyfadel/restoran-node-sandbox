const Sequelize = require('sequelize');
const slugify = require('slugify');

const sequelize = require('../../util/sequelize/database');
const MenuItem = require('./menu-item-model');

const MenuCategory = sequelize.define('menu_category', {
    // Define attributes of a category
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
            // Set the catName to the value passed in
            this.setDataValue('name', value);
            this.setDataValue('slug', slugify(value, {lower: true, trim: true}));
        }
    },
    adjective: {
        type: Sequelize.STRING,
        allowNull: false
    },
    icon: {
        type: Sequelize.STRING,
        allowNull: true
    },
    slug : {
        type: Sequelize.STRING,
        allowNull: false
    }
});


// MenuCategory.associate = (models) => {
//     MenuCategory.hasMany(models.MenuItem, {
//         foreignKey: 'cat_id'
//     });
// }


module.exports = MenuCategory;