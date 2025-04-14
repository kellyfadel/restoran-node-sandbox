const mongoose = require('mongoose');
const slugify = require('slugify');

const Schema = mongoose.Schema;

// Defining the schema of what a category looks like
const menuCategorySchema = new Schema({
    name : {
        type: String,
        required: true,
        set: function(value) {
            // Set the cat slug to the slugified version of the name
            this.slug = slugify(value, {lower: true, trim: true});
            // Whatever the function returns will be the catName
            return value;
        }
    },
    adjective : {
        type: String,
        required: true
    },
    slug : {
        type: String,
        required: true
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem'
    }]
});


// Create a model based on the schema
module.exports = mongoose.model("MenuCategory", menuCategorySchema)