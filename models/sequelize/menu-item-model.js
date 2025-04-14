const {DataTypes} = require('sequelize');
const slugify = require('slugify');
const MenuCategory = require('./menu-category-model');

const sequelize = require('../../util/sequelize/database');

const MenuItem = sequelize.define('menu_item', {
    // Define attributes of a menu item
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            // Set the name to the value passed in
            this.setDataValue('name', value);
            this.setDataValue('slug', slugify(value, {lower: true, trim: true}));
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// MenuItem.associate = (models) => {
//     MenuItem.belongsTo(models.MenuCategory, {
//         foreignKey: 'cat_id'
//     });
// }


module.exports = MenuItem;