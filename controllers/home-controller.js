// const Contact = require('../models/contact-model');
const Employee = require('../models/sequelize/employee-model');
const Contact = require('../models/mongoose/contact-model-mongoose');
const Testimonial = require('../models/mongoose/testimonial-model-mongoose');
const mongoose = require('mongoose');


exports.getHome = (req, res) => {
    res.render('index', { title: 'Home' });
};

exports.getTemp = (req, res) => {
    res.render('temp', { title: 'Temp' });
};

exports.getAbout = (req, res) => {
    res.render('about', { title: 'About' });
};

exports.getContact = (req, res) => {
    res.render('contact', { title: 'Contact' });
};

exports.getTeam = async (req, res, next) => {
    const employees = await Employee.find();

    res.render("team", {employees})
};

exports.getTestimonials = async (req, res, next) => {

    try {
        const testimonials = await Testimonial.find().populate("user");
        res.render("testimonials", {testimonials});
    } catch (error) {
        console.log(error);
    }
    
};
exports.getTestimonialNew = (req, res, next) => {
    // const employees = await Employee.findAll();

    res.render("testimonial-new");
};

exports.postContact = (req, res, next) => {
    // Retrieve the data from the form
    const {name, email, subject, message} = req.body;

    // Log the request body to the console
    console.log("Body is: ", req.body);

    // Create a new contact record in the database
    Contact.create({
        // _id: new mongoose.Types.ObjectId('67dc30f53ccb968588b35698'),
        date: new Date(),
        name: name,
        email: email,
        subject: subject,
        message: message,
        response: null,
        responseDate: null
    })
    .then((response) => {
        console.log("Success!", response);
        res.render("contact", {pageTitle: "Contact", message: "Thank you!  Your request was received."});
    })
    .catch((err) => {
        console.log("Raw error is: ", err);

        if (err.name === 'ValidationError') {
            console.log("Object.values of err.errors is: ", Object.values(err.errors));
            return res.render("contact", {pageTitle: "Contact", message: "Oops, something went wrong.  Please try again.", entries: req.body, errors: Object.values(err.errors)});
        }

        next(new Error('Data could not be saved.  Please try again later.'));


       
    })
};

exports.getContactsWithoutResponse = async (req, res, next) => {

    const contactRequests = await Contact.find({response: null});

    console.log("requests are: ", contactRequests);
    res.locals.contactRequests = contactRequests;
    next();
   
}

exports.loadContactRequest = async (req, res, next) => {

    const {contactId} = req.body;
    console.log("contactId from body is: ", contactId);
    const contactRequest = await Contact.findById(contactId);

    console.log("retrieved contact request is: ", contactRequest);
    res.locals.selectedContact = contactRequest;
    next();
}

exports.renderContactRequests = (req, res) => {
    res.render("contact-respond");
}

exports.postContactResponse = async (req, res, next) => {
    console.log("req.body is: ", req.body);

    const {id, response} = req.body;

    const result = await Contact.findByIdAndUpdate(id, {$set: {response: response, responseDate: new Date()}}, {new: true});
    next();

}

exports.postTestimonial = async (req, res, next) => {
try {
    const response = await Testimonial.create({
        content: req.body.content,
        user: req.session.user._id
    });
    console.log("Success!", response);
    res.render("testimonial-new", {pageTitle: "Add Testimonial", message: "Thank you!  Your testimonial has been saved."});

} catch (err) {
    console.log("Raw error is: ", err);

    if (err.name === 'ValidationError') {
        console.log("Object.values of err.errors is: ", Object.values(err.errors));
        return res.render("testimonial-new", {pageTitle: "Add Testimonial", message: "Oops, something went wrong.  Please try again.", entries: req.body, errors: Object.values(err.errors)});
    }

    next(new Error('Testimonial could not be saved.  Please try again later.'));
}
}