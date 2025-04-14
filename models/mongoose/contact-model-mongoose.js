const mongoose = require('mongoose');


const Schema = mongoose.Schema;

// Schema defines what the object should look like in database
const contactSchema = new Schema({
   name: {
        type: String,
        required: [true, 'Please provide your name.'] // Custom validation message
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address.'],
        validate:{
            validator: (value) => { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);},
            message: (props) => `${props.value} is not a valid email address!`
        }
    },
    subject: {
        type: String,
        required: [true, 'Subject is required.']
    },
    message: {
        type: String,
        required: [true, 'Message is required.']
    },
    date:{
        type: Date,
        default: Date.now
    },
    response: {
        type: String
    },
    responseDate: {
        type: Date
    }    
},
{timestamps: true})  // Provides a createdAt and updatedAt field in database to track changes


// Model implements the schema and provides functions for working with the objects
module.exports = mongoose.model('Contact', contactSchema);