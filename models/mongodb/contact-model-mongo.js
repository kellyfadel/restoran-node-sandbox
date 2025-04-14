// const db = require('../util/database');

const getDb = require('../../util/mongodb/database-mongo').getDb
const { ObjectId } = require("mongodb");

module.exports = class Contact {

   

    

    static insertContact(data) {
        const db = getDb();
        return db.collection('contacts').insertOne(data);
    }

    static getContactsWithNoResponse() {
        const db = getDb();
        return db.collection('contacts').find({
            responseDate: null
        }).toArray();
    }

    static getContactRequestById(id) {
        const db = getDb();
        return db.collection('contacts').findOne({
            _id: ObjectId.createFromHexString(id)
        })
    }

    static setContactResponse(id, response) {
        const db = getDb();
        return db.collection('contacts').updateOne({
            _id: new ObjectId(id)
        },{
            $set: {response: response, responseDate: new Date()}
        })
    }

}