"use strict";
var express = require("express");
var router = express.Router();
var User = require("../models/user");
var globalFunctions = require("../controllers/globalFunctions");
var passport = require("passport");
var path = require("path");
var fs = require("fs");

var registrationValidation = globalFunctions.registrationValidation;

// user cannot visit login page if he/she is already logged in
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    res.redirect("/users");
  else return next();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// render the homepage
router.get("/", function(req, res) {
  res.render("index");
});

// register page
router.get("/register", function(req, res) {
  res.render("register");
});

// login page
router.get("/login", isLoggedIn, function(req, res) {
  res.render("login", {
    title: "Gradesheet - Login"
  });
});

// register a new user
router.post("/register", function(req, res) {
  req = registrationValidation(req, res);
  // eq.validationErrors() is deprecated, use getValidationResult() instead
  req.getValidationResult().then(function(result) {
    var newUser, base64data, bitmap, gender;
    var errors = result.useFirstErrorOnly().array();
    if(errors.length !== 0) {
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
      // assign default avatar
      req.body.gender === "male" ?
        bitmap = fs.readFileSync(path.join(__dirname + "/../public/images/man-1.png")) :
        bitmap = fs.readFileSync(path.join(__dirname + "/../public/images/woman-1.png"));
      gender = capitalize(req.body.gender);
      base64data = bitmap.toString("base64");
      newUser = new User({
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
      User.createUser(newUser, function(err, user) {
        if(err) throw err;
      });
      req.flash("success_msg", "You are registered and can now login.");
      res.redirect("login");
    }
  });
});

router.post("/login",
  passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success_msg", "You have been logged out.");
  res.redirect("/login");
});

module.exports = router;
