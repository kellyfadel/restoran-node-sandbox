const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const User = require("../models/mongoose/user-model-mongoose");

exports.getLogin = (req, res) => {
  res.render("auth/login");
};

exports.getSignup = (req, res) => {
  res.render("auth/signup");
};

exports.getProfile = (req, res) => {
  res.render("auth/profile");
};

exports.authUser = async (req, res, next) => {
  // Retrieve values from form
  const email = req.body.email;
  const password = req.body.password;

  console.log("body from authUser is: ", req.body);
  console.log("email and password from authUser are: ", email, password);

  try {
    // Find matching user by email
    const user = await User.findOne({ email: email });
    let passwordsMatch = false;
    if (user) {
      passwordsMatch = await user.validatePassword(password);
    }
    res.locals.user = user;
    res.locals.passwordsMatch = passwordsMatch;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
};

exports.loginWebApp = async (req, res, next) => {
  const { user, passwordsMatch } = res.locals;
  // console.log("user and password are", user, passwordsMatch);

  if (user && passwordsMatch) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save((err) => {
      console.log(err);
      req.flash("success", "Login Successful!");

      if (req.session.returnTo) {
        let redirectTo = req.session.returnTo;
        delete req.session.returnTo; // Prevent looping
        return res.redirect(redirectTo);
      }
      res.redirect("/"); // Default return to home page
    });
  }
  return res.render("auth/login", {
    pageTitle: "Login",
    message: "Invalid Credentials",
    entries: req.body,
  });
};

// exports.postLogin = async (req, res, next) => {
//   // Retrieve values from form

//   const { email, password } = req.body;

//   try {
//     // Find matching user by email
//     const user = await User.findOne({ email: email });

//     if (!user) {
//       return res.render("auth/login", {
//         title: "Login",
//         message: "Invalid Credentials.",
//         entries: req.body,
//       });
//     }

//     const passwordsMatch = await user.validatePassword(password);

//     if (!passwordsMatch) {
//       return res.render("auth/login", {
//         title: "Login",
//         message: "Invalid Credentials.",
//         entries: req.body,
//       });
//     }

//     if (user && passwordsMatch) {
//       req.session.isAuthenticated = true;
//       req.session.user = user;
//       return req.session.save((err) => {
//         console.log(err);
//         req.flash("success", "Login Successful!");

//         if (req.session.returnTo) {
//           let redirectTo = req.session.returnTo;
//           delete req.session.returnTo; // Prevent looping
//           return res.redirect(redirectTo);
//         }
//         res.redirect("/"); // Default return to home page
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.render("auth/login", {
//       title: "Login",
//       message: "Oops, something went wrong.  Please try again.",
//       entries: req.body,
//       errors: Object.values(err.errors),
//     });
//   }
// };

exports.postSignup = async (req, res, next) => {
  // Retrieve data from the form

  const { firstname, lastname, email, password, confirmpassword } = req.body;

  // Make sure password and confirm password match
  if (password !== confirmpassword) {
    return res.render("auth/signup", {
      title: "Signup",
      errors: [
        {
          path: "confirmPassword",
          message: "Please make sure your passwords match.",
        },
      ],
      entries: req.body,
    });
  }

  try {
    // Use static method of model to check if the email is unique
    const emailUnique = await User.checkEmailUnique(email);

    if (!emailUnique) {
      return res.render("auth/signup", {
        pageTitle: "Signup",
        errors: [
          {
            path: "email",
            message: "Sorry, that email address is taken.  Please choose a different one.",
          },
        ],
        entries: req.body,
      });
    }

    // Create the new user
    // Could also use User.create instead

    const user = new User({
      firstName: firstname,
      lastName: lastname,
      email: email,
      password: password,
    });
    await user.save();

    // Store user in session

    req.session.isAuthenticated = true;
    req.session.user = user;

    req.session.save((err) => {
      if (err) {
        console.log("Error saving session: ", err);
      }
      req.flash("success", "Signup Successful!");

      if (req.session.returnTo) {
        let redirectTo = req.session.returnTo;
        delete req.session.returnTo; // Prevent looping
        return res.redirect(redirectTo);
      }
      res.redirect("/"); // Default redirect to home page
    });
  } catch (err) {
    // Something went wrong at the database level (e.g., model validation)
    console.log(err);
    res.render("auth/signup", {
      pageTitle: "Signup",
      entries: req.body,
      errors: Object.values(err.errors),
    });
  }
};

exports.uploadProfilePic = (req, res, next) => {
  // const { firstname, lastname, email, profession } = req.body;
  const file = req.files?.profilePic;

  if (file) {
    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      req.flash("error", "Only .jpg and .png files are allowed.");
      return res.redirect("/auth/profile");
    }

    // Check and delete existing image if it exists
    if (req.session.user?.profilePic) {
      const existingImagePath = path.join(__dirname, "..", "public", "img", "users", req.session.user.profilePic);
      if (fs.existsSync(existingImagePath)) {
        fs.unlink(existingImagePath, (err) => {
          if (err) {
            console.error("Error deleting existing image:", err);
          } else {
            console.log("Existing profile image deleted successfully.");
          }
        });
      } else {
        console.log("File ", existingImagePath, "does not exist!")
      }
    }

    // Generate random filename with extension
    const ext = path.extname(file.name); // e.g., .jpg or .png
    const randomName = crypto.randomBytes(16).toString("hex") + ext;
    req.body.filename = randomName;

    // Set upload directory
    const uploadDir = path.join(__dirname, "..", "public", "img", "users");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, randomName);

    // Move file
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error("File upload error:", err);
        req.flash("error", "File upload failed.");
        return res.redirect("/auth/profile");
      }
      return next();
    });
  } else {
    next();
  }
};

exports.postProfile = async (req, res, next) => {
  try {
    console.log("post profile running!!");
    // Retrieve user from database
    const user = await User.findById(req.session.user._id);

    if (!user) {
      req.flash("error", "Could not retrieve user data.");
      return res.redirect("/auth/profile");
    }

    user.firstName = req.body.firstname;
    user.lastName = req.body.lastname;
    user.email = req.body.email;
    user.profession = req.body.profession;
    user.profilePic = req.body.filename;


    await user.save();

    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        console.log("Error saving session: ", err);
      }

      req.flash("success", "Profile Updated!");
      console.log("Arrived here!");
      return res.redirect("/auth/profile");
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    req.flash("error", "Could not save profile data");
    return res.redirect("/auth/profile");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/auth/login"); // Redirect to login or homepage
  });
};

// Middleware function to verify that user is logged in before proceeding.
exports.verifyAuth = (req, res, next) => {
  if (req.session.isAuthenticated) return next();
  req.flash("error", "Please login to access this page.");
  req.session.returnTo = req.originalUrl; // Store the URL of the original request in session to redirect user upon successful login.
  res.redirect("/auth/login");
};

// Middleware function to verify that user is an admin in before proceeding.
exports.verifyAdmin = (req, res, next) => {
  if (req.session.user?.roles.includes("admin")) return next();
  req.flash("error", "You must be an administrator to access this page.");
  req.session.returnTo = req.originalUrl;
  res.redirect("/auth/login");
};
