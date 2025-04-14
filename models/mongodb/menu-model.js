// const db = require('../util/database');

const getDb = require('../../util/database-mongo').getDb

module.exports = class Menu {

   

    static fetchMenu() {
        const db = getDb();
        return db.collection('menu').find().toArray()
    }

    static fetchCategoryByItemSlug(slug) {
        const db = getDb();
        return db.collection('menu').findOne(
            {'items.slug': slug}        
        )
    }

    static insertContact(data) {
        const db = getDb();
        return db.collection('contacts').insertOne(data);
    }

    static fetchAllCategories() {
        return db.execute('SELECT * FROM menu_categories');
    }

    static fetchAllItems() {
        return db.execute('SELECT * FROM menu_items');
    }

    static fetchMenuItemById(id) {
        return db.execute(
            `SELECT c.name AS catName, i.cat_id AS catId, i.id, i.name AS itemName, price, description, image
             FROM menu_items i
             JOIN menu_categories c ON i.cat_id = c.id
             WHERE i.id = ?`, [id]);
    }

    // static findById(id) {
    //     return db.execute('SELECT * FROM menu WHERE id = ?', [id]);
    // }

    // static findByCategory(category) {
    //     return db.execute('SELECT * FROM menu WHERE category = ?', [category]);
    // }

    // static addMenuItem(name, price, description, category) {
    //     return db.execute('INSERT INTO menu (name, price, description, category) VALUES (?, ?, ?, ?)', [name, price, description, category]);
    // }

    // static updateMenuItem(id, name, price, description, category) {
    //     return db.execute('UPDATE menu SET name = ?, price = ?, description = ?, category = ? WHERE id = ?', [name, price, description, category, id]);
    // }

    // static deleteMenuItem(id) {
    //     return db.execute('DELETE FROM menu WHERE id = ?', [id]);
    // }
}