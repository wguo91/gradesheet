"use strict";
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    expressHandlebars = require("express-handlebars"),
    expressValidator = require("express-validator"),
    flash = require("connect-flash"),
    session = require("express-session"),
    passport = require("passport"),
    mongoose = require("mongoose"),
    morgan = require("morgan"),
    config = require("./config"),
    routes = require("./routes/index"),
    users = require("./routes/users"),
    assignments = require("./routes/assignments"),
    students = require("./routes/students"),
    grades = require("./routes/grades"),
    User = require("./models/user"),
    Collection = require("./models/collection"),
    passportConfig = require("./config/passport"),
    setupController = require("./controllers/setupController");

// set up mock data
setupController.restart();
setupController.initialize();

// set up mongoose
mongoose.connect(config.databaseURI);

// set up the view directory
app.set("views", path.join(__dirname, "views"));

// set up custom helpers for handlebars
var handlebars = expressHandlebars.create({
  defaultLayout: "layout"
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// set up body-parser and morgan middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan("dev"));

// set static folder directory
app.use(express.static(path.join(__dirname, "public")));

// set up express-session (DO THIS BEFORE INITIALIZING PASSPORT)
app.use(session({
  secret: config.secret, // used to sign the session ID cookie
  saveUninitialized: true, // forces a session to be saved to the store
  resave: true // forces the session to be saved back to the store
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set up connect-flash
app.use(flash());

// set up global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// set up express-validator
app.use(expressValidator({
  // define custom validators
  customValidators: {
    isUsernameAvailable: function(username) {
      return new Promise(function(resolve, reject) {
        User.findOne({username: username}, function(err, existingUser) {
          if(err) return resolve(err);
          if(existingUser) reject(existingUser);
          resolve("Available");
        });
      });
    },
    isEmailAvailable: function(email) {
      return new Promise(function(resolve, reject) {
        User.findOne({email: email}, function(err, existingEmail) {
          if(err) return resolve(err);
          if(existingEmail) reject(existingEmail);
          resolve("Available");
        });
      });
    },
    isAsgtNameAvailable: function(asgtName) {
      return new Promise(function(resolve, reject) {
        Collection.findOne({name: asgtName}, function(err, collection) {
          if(err) return resolve(err);
          if(collection) reject(collection);
          resolve("Available");
        });
      });
    }
  },
  errorFormatter: function(param, msg, value) {
    var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
    while(namespace.length) {
      formParam += "[" + namespace.shift() + "]";
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// set up routes
app.use("/", routes);
app.use("/users", users);
app.use("/users/assignments", assignments);
app.use("/users/students", students);
app.use("/users/grades", grades);
app.use(function(req, res) {
  res.status(404);
  res.render("404", {
    title: "404 - Page Not Found"
  });
});
app.use(function(req, res) {
  res.status(500);
  res.render("500", {
    title: "500 - Internal Server Error"
  });
});

app.listen(config.port);
