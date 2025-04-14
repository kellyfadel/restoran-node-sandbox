const path = require("path");
require("dotenv").config();

const express = require("express");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
var cookieParser = require('cookie-parser')
const {doubleCsrf} = require('csrf-csrf');
const fileUpload = require("express-fileupload");
const compression = require("compression");
const helmet = require("helmet");


const menu = require("./data/menu.json");



//import controllers
const menuController = require("./controllers/menu-controller");
const homeController = require("./controllers/home-controller");
const authController = require("./controllers/auth-controller");
const errorController = require("./controllers/error-controller");
const apiController = require("./controllers/api-controller");
const recipeController = require('./controllers/recipe-controller');


//import models
const MenuCategory = require("./models/sequelize/menu-category-model");
const MenuItem = require("./models//sequelize/menu-item-model");

// Database connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Initialize session store
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// Initialize CSRF protection
const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "_csrf", // CSRF token cookie name
  cookieOptions: { sameSite: "lax", secure: false }, // Set secure to true in production
  getTokenFromRequest: (req) => req.body._csrf // Tell the package that the token will come from a field called _csrf in req.body
});

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // parse JSON request bodies
app.use(cookieParser());
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
         "'unsafe-inline'",
        'https://cdn.jsdelivr.net', // if you're loading Bootstrap CSS
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com'

      ],
      fontSrc: ["'self'", 
        'https://cdn.jsdelivr.net', 
        'https://fonts.googleapis.com', 
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'],
        
      imgSrc: ["'self'", 'data:'], // if needed
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Register session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60, // cookie lasts for one hour
      sameSite: true, // prevent cookie from being sent to other sites (CSRF)
    },
  })
);

// Register flash messages
app.use(flash());

// Mount fileupload middleware (make sure this comes BEFORE csrfProtection!!!)
app.use(fileUpload());

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // skip csrf for API routes
  }
  csrfProtection.doubleCsrfProtection(req, res, function (err) {
    if (err) return next(err);
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  
});

// Register csrf protection
// app.use(csrfProtection.doubleCsrfProtection);

app.use((req, res, next) => {
  console.log("Session data is: ", req.session);
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  res.locals.user = req.session.user || {};
  res.locals.isAdmin = req.session.user?.roles?.includes("admin") || false;
  // console.log("isAdmin is: ", res.locals.isAdmin);
  res.locals.flashMessages = req.flash() || {};
  // res.locals.csrfToken = req.csrfToken();
  // res.locals.csrfToken = "temp";
  next();
});

// Routes

app.get("/", homeController.getHome);

app.get("/temp", homeController.getTemp);

app.get("/about", homeController.getAbout);

app.get("/contact", homeController.getContact);

app.post("/contact", homeController.postContact);

app.get("/contactrespond", authController.verifyAdmin, homeController.getContactsWithoutResponse, homeController.renderContactRequests);
app.post("/loadcontactrequest", homeController.getContactsWithoutResponse, homeController.loadContactRequest, homeController.renderContactRequests);
app.post("/postcontactresponse", homeController.postContactResponse, homeController.getContactsWithoutResponse, homeController.renderContactRequests);

app.get("/team", homeController.getTeam);
app.get("/testimonials", homeController.getTestimonials);
app.get("/testimonial/new", authController.verifyAuth, homeController.getTestimonialNew);
app.post("/testimonial", authController.verifyAuth, homeController.postTestimonial);

app.get("/menu", menuController.getMenu);
app.get("/menu/:selectedCategory", menuController.getMenu);
app.get("/menu/:selectedCategory/:itemSlug", menuController.getMenuItem);

app.use("/recipes", recipeController.recipeApiAuthenticate);
app.get("/recipes", recipeController.getRecipes);
app.get("/recipes/type/:selectedMealType", recipeController.getRecipes);
app.get("/recipes/:recipeId", recipeController.getRecipe);

app.get("/auth/login", authController.getLogin);
app.get("/auth/signup", authController.getSignup);
app.get("/auth/profile", authController.verifyAuth, authController.getProfile);
app.get("/auth/logout", authController.logout);

app.post("/auth/login", authController.authUser, authController.loginWebApp);
app.post("/auth/signup", authController.postSignup);
// app.post("/auth/profile", authController.postProfile);
app.post("/auth/profile", authController.uploadProfilePic, authController.postProfile);
// app.post("/auth/profile", (req, res) => {res.send("iN the inline method!")});

app.get("/testform", (req, res) => {res.render("test-form")});
app.post("/testform", (req, res) => {res.send("In the post event handler!")});

app.post("/api/auth", authController.authUser, apiController.getToken);
app.use(apiController.verifyToken);
app.get("/api/menu", apiController.getMenuData, apiController.sendResponse);
app.get("/api/menu/:category", apiController.getMenuDataByCategory, apiController.sendResponse);
app.get("/api/menu/items/:item", apiController.getMenuItemData, apiController.sendResponse);
app.use("/api", apiController.errorHandler);

// app.get("/testform", csrfProtection.doubleCsrfProtection, (req, res) => {res.render("test-form", {csrfToken: req.csrfToken()})});
// app.post("/testform", upload.none(), csrfProtection.doubleCsrfProtection, (req, res) => {res.send("In the post event handler!")});

app.use(errorController.get404);
app.use(errorController.get500);



mongoose.connect(MONGODB_URI).then(() => {
  // Launch the app
  app.listen(3000);
});
