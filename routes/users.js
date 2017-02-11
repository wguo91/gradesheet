"use strict";
var express = require("express");
var router = express.Router();
var path = require("path");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var globalFunctions = require("../controllers/globalFunctions");

// set up multer
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({storage: storage});

// initialize global functions
var ensureAuth = globalFunctions.ensureAuth;
var capitalize = globalFunctions.capitalize;
var calcGrade = globalFunctions.calcGrade;
var getAvgArray = globalFunctions.getAvgArray;

// 50KB
const MAX_AVATAR_SIZE = 50000;

// GET dashboard
router.get("/", ensureAuth, function(req, res) {
  // student dashboard
  if(!req.user.admin) {
    // obtain logged-in user's information to calculate statistics
    Assignment.find({"completedBy.studentId": req.user._id},
      function(err, asgts) {
      if(asgts.length > 0) {
        Collection.find({}, function(err, collections) {
          if(err) throw new Error("Collection.find({}) failed.");
          var overallGrade = calcGrade(asgts);
          var avgArray = getAvgArray(collections);
          res.render("dashboard", {
            title: "Gradesheet - Dashboard",
            asgts: asgts,
            avgArray: avgArray,
            overallGrade: overallGrade
          });
        });
      }
    });
  // admin dashboard
  } else {
    User.getFiveStudents(function(err, users) {
      if(err) throw err;
      res.render("dashboard", {
        title: "Gradesheet - Dashboard",
        users: users
      });
    });
  }
});

// GET user settings page
router.get("/settings", ensureAuth, function(req, res) {
  res.render("settings", {
    title: "Gradesheet - Settings"
  });
});

// GET user update page
router.get("/settings/update/:type", ensureAuth, function(req, res) {
  var updateField = req.params.type;
  var capitalizedField = capitalize(updateField);
  var isPW = updateField.charAt(0) === "p";
  res.render("update", {
    title: "Gradesheet - Change " + capitalizedField,
    curr: req.user[updateField],
    updateField: capitalizedField,
    isPW: isPW
  });
});

// POST settings
router.post("/settings/upload", ensureAuth, upload.single("avatar"),
  function(req, res) {
  // file.buffer and file.mimetype are available through multer middleware
  var base64String = req.file.buffer.toString("base64");
  var mimetype = req.file.mimetype;
  var sizeError = false;
  if(req.file.size > MAX_AVATAR_SIZE) {
    sizeError = true;
  } else {
    // update avatar with new base64 encoded string
    User.update({username: req.user.username}, {
      avatar: {
        img: {
          encodedData: base64String,
          mimetype: mimetype
        }
      }
    }, function(err) {
      if(err) throw err;
      if(sizeError) {
        req.flash("error_msg", "File size must not exceed 50KB. "+
         "Please try a different image.");
      } else {
        req.flash("success_msg", "Avatar successfully updated.");
        res.redirect("/users/settings");
      }
    });
  }
});

// POST update settings
router.post("/settings/update/:type", ensureAuth, function(req, res) {
  var updateField = req.params.type;
  var isUsername = updateField.charAt(0) === "u";
  var capitalizedField = capitalize(updateField);
  // update password
  if(updateField.charAt(0) === "p") {
    // form validation
    req.checkBody({
      "currPW": {
        notEmpty: true,
        errorMessage: "Current password is required."
      },
      "newPW": {
        notEmpty: true,
        isLength: {
          options: [{min: 6, max: 30}],
          errorMessage: "New password must be between 6 and 30 characters long."
        },
        matches: {
          options: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/],
          errorMessage: "Password must contain at least one uppercase letter "+
            "and one numeric symbol."
        },
        errorMessage: "New password is required."
      },
      "confirmPW": {
        notEmpty: true,
        matches: {
          options: [req.body.newPW],
          errorMessage: "Passwords do not match."
        },
        errorMessage: "Please confirm your password."
      }
    });
    // handle validation errors
    req.getValidationResult().then(function(result) {
      var errors = result.useFirstErrorOnly().array();
      // validate the current password
      User.isCurrPW(req.user.username, req.body.currPW,
        function(err, isMatch) {
        if(err) throw err;
        if(!isMatch) {
          errors.push({
            param: "password",
            msg: "Current password is incorrect.",
            value: undefined
          });
        }
        if(errors.length !== 0) {
          res.render("update", {
            errors: errors,
            title: "Gradesheet - Change " + capitalizedField,
            isPW: true
          });
        } else {
          User.updatePW(req.user.username, req.body.newPW, function(err, doc) {
            if(err) throw err;
            req.flash("success_msg", "Password successfully updated.");
            res.redirect("/users/settings/update/password");
          });
        }
      });
    });
  } else {
    // update username or email
    if(isUsername) {
      // form validation for username
      req.checkBody({
        "username": {
          notEmpty: true,
          isLength: {
            options: [{min: 6, max: 30}],
            errorMessage: "Usernames must be between 6 and 30 characters long."
          },
          isUsernameAvailable: {
            errorMessage: "Username is not available. "+
              "Please choose another one."
          },
          matches: {
            options: [/^(?![_.])(?!.*[_.]{2})[A-Za-z\d_.]+(?![_.])$/],
            errorMessage: "Username can only contain underscores, dots, and "+
              "alphanumeric characters (usernames beginning/ending with"+
              "underscores and dots, and/or containing a series of"+
              "underscores and dots are not allowed)."
          },
          errorMessage: "Username is required."
        }
      });
    } else {
      // form validation for email
      req.checkBody({
        "email": {
          notEmpty: true,
          isEmail: {
            errorMessage: "Email address provided is not valid."
          },
          isEmailAvailable: {
            errorMessage: "Email address is not available. "+
              "Please choose another one."
          },
          errorMessage: "Email address is required."
        }
      });
    }
    // handle validation errors
    req.getValidationResult().then(function(result) {
      var errors = result.useFirstErrorOnly().array();
      if(errors.length !== 0) {
        res.render("update", {
          errors: errors,
          title: "Gradesheet - Change " + capitalizedField,
          updateField: updateField,
          curr: req.user[updateField],
          new: req.body[updateField]
        });
      } else {
        if(isUsername) {
          User.update({username: req.user.username}, {
            username: req.body.username
          }, function(err) {
            if(err) throw err;
            req.flash("success_msg", capitalizedField+" successfully updated.");
            res.redirect("/users/settings/update/username");
          });
        } else {
          User.update({email: req.user.email}, {
            email: req.body.email
          }, function(err) {
            if(err) throw err;
            req.flash("success_msg", capitalizedField+" successfully updated.");
            res.redirect("/users/settings/update/email");
          });
        }
      }
    });
  }
});

module.exports = router;
