"use strict";
var express = require("express");
var router = express.Router();
var passport = require("passport");
var fs = require("fs");
var path = require("path");
var User = require("../models/user");
var globalFunctions = require("../controllers/globalFunctions");

// initialize global functions
var registrationValidation = globalFunctions.registrationValidation;
var capitalize = globalFunctions.capitalize;

// user cannot visit login page if he/she is already logged in
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    res.redirect("/users");
  else return next();
}
// GET homepage
router.get("/", function(req, res) {
  res.render("index", {
    title: "Gradesheet"
  });
});

// GET register page
router.get("/register", isLoggedIn, function(req, res) {
  res.render("register", {
    title: "Gradesheet - Register"
  });
});

// GET login page
router.get("/login", isLoggedIn, function(req, res) {
  res.render("login", {
    title: "Gradesheet - Login"
  });
});

// GET logout page
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success_msg", "You have been logged out.");
  res.redirect("/login");
});

// POST register user
router.post("/register", function(req, res) {
  req = registrationValidation(req, res);
  // eq.validationErrors() is deprecated, use getValidationResult() instead
  req.getValidationResult().then(function(result) {
    var user, base64data, bmPath;
    var gender = req.body.gender;
    var errors = result.useFirstErrorOnly().array();
    if(errors.length !== 0) {
      // "remember" what the user entered
      res.render("register", {
        errors: errors,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        male: req.body.gender === "male",
        female: req.body.gender === "female"
      });
    } else {
      // assign default avatar based on gender, convert avatar to base64 data
      bmPath = path.join(__dirname, "/../public/images/"+gender+".png");
      base64data = (fs.readFileSync(bmPath)).toString("base64");
      gender = capitalize(gender);
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: gender,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        avatar: {
          img: {
            encodedData: base64data,
            mimeType: "image/png"
          }
        },
        admin: false
      });
      User.createUser(user, function(err, user) {
        if(err) throw err;
      });
      req.flash("success_msg", "You are registered and can now login.");
      res.redirect("login");
    }
  });
});

// POST login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/login",
    failureFlash: true
  })
);

module.exports = router;
