const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"]
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    validate:{
      validator: (value) => { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);},
      message: (props) => `${props.value} is not a valid email address!`
  }
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minLength: [6, "Password must be at least 6 characters"]
  },
  roles: {
    type: [String], // Allows multiple roles
    enum: ["user", "admin"], // Restricts allowed values
    default: ["user"], // Default role is "user"
    validate: {
      validator: function (roles) {
        return roles.every(role => ["user", "admin"].includes(role)); // Ensures only valid roles are used
      },
      message: (props) => `Invalid role(s): ${props.value.join(", ")}. Allowed roles are: user, admin.`
    }
  },
  profession: {
    type: String,
    required: false
  },
  profilePic: {
    type: String,
    required: false
  }
});

// Pre-save hook for setting user password
// https://mongoosejs.com/docs/middleware.html
userSchema.pre("save", async function () {
  if (this.isModified("password")) { // Check to see if password is being changed.
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Instance method for checking the user password
// Use instance methods when you want to do something with a specific model instance (like validate a password)
// The *this* keyword will refer to the specific instance on which the method is called
// Use standard function declaration (not ES6 arrow functions) so that *this* is properly bound to the model instance 
// https://mongoosejs.com/docs/guide.html#methods
userSchema.methods.validatePassword = function (enteredPassword) {
  // bcrypt.compare returns true if the passwords match, false otherwise
  return bcrypt.compare(enteredPassword, this.password);
};

// Static method for checking if email is unique
// Use static methods when you want to do something with a with the model in general (like search for an instance with a given email address)
// The *this* keyword will refer to the model itself
// Use standard function declaration (not ES6 arrow functions) so that *this* is properly bound to the model 
// https://mongoosejs.com/docs/guide.html#statics
userSchema.statics.checkEmailUnique = async function (email) {
  const user = await this.findOne({email: email});
  // Return true if we don't find an existing user with the email address, false otherwise
  return !Boolean(user);
}

module.exports = mongoose.model("User", userSchema);
