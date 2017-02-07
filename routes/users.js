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

// user dashboard
router.get("/", ensureAuth, function(req, res) {
  if(!req.user.admin) {
    Assignment.find({"completedBy.studentId": req.user._id}, function(err, asgts) {
      if(asgts.length > 0) {
        Collection.find({}, function(err, collections) {
          if(err) throw new Error("Collection.find({}) failed.");
          var overallGrade = calcGrade(asgts);
          var avgArray = getAvgArray(collections);
          res.render("dashboard", {
            asgts: asgts,
            avgArray: avgArray,
            overallGrade: overallGrade
          });
        });
      }
    });
  } else {
    User.getFiveStudents(function(err, users) {
      if(err) throw err;
      res.render("dashboard", {
        title: "Gradesheet",
        users: users
      });
    });
  }
});

// user settings
router.get("/settings", ensureAuth, function(req, res) {
  res.render("settings", {
    title: "Gradesheet - Settings"
  });
});

router.post("/settings/upload", ensureAuth,
  upload.single("avatar"), function(req, res, next) {
  var base64String = req.file.buffer.toString("base64");
  var mimetype = req.file.mimetype;
  var change = true;
  if(req.file.size > (50 * 1000)) // file size must be <= 50KB
    change = false;
  else {
    User.update({username: req.user.username}, {
      avatar: {
        img: {
          encodedData: base64String,
          mimetype: mimetype
        }
      }
    }, function(err, affected) {
      if(err) throw err;
      // ensure update finishes before redirect
      res.redirect("/users/settings");
    });
  }
  if(change)
    req.flash("success_msg", "Avatar successfully updated.");
  else
    req.flash("error_msg", "File size must not exceed 50KB. Please try a different image.");
});

// user updates
router.get("/settings/update/:type", ensureAuth, function(req, res) {
  var isPasswordUpdate = false;
  var updateField = req.params.type;
  var isPasswordUpdate = updateField.charAt(0) === "p";
  res.render("update", {
    title: "Gradesheet - Change " + updateField,
    currentValue: req.user[updateField],
    updateField: updateField,
    isPasswordUpdate: isPasswordUpdate
  });
});

router.post("/settings/update/:type", ensureAuth, function(req, res) {
  var updateField = req.params.type;
  var isUsername = updateField.charAt(0) === "u";
  var capitalizedField = capitalize(updateField);
  // update password
  if(updateField.charAt(0) === "p") {
    req.checkBody({
      "currentPassword": {
        notEmpty: true,
        errorMessage: "Current password is required."
      },
      "newPassword": {
        notEmpty: true,
        isLength: {
          options: [{min: 6, max: 30}],
          errorMessage: "Password must be between 6 and 30 characters long."
        },
        matches: {
          options: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/],
          errorMessage: "Password must contain at least one uppercase letter and one numeric symbol."
        },
        errorMessage: "New password is required."
      },
      "confirmPassword": {
        notEmpty: true,
        matches: {
          options: [req.body.newPassword],
          errorMessage: "Passwords do not match."
        },
        errorMessage: "Please confirm your password."
      }
    });
    req.getValidationResult().then(function(result) {
      var errors = result.useFirstErrorOnly().array();
      // validate the current password
      User.isCurrentPassword(req.user.username, req.body.currentPassword, function(err, isMatch) {
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
            isPasswordUpdate: true
          });
        } else {
          User.updatePassword(req.user.username, req.body.newPassword, function(err, doc) {
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
      req.checkBody({
        "username": {
          notEmpty: true,
          isLength: {
            options: [{min: 6, max: 30}],
            errorMessage: "Username must be between 6 and 30 characters long."
          },
          isUsernameAvailable: {
            errorMessage: "Username is not available. Please choose another one."
          },
          matches: {
            options: [/^(?![_.])(?!.*[_.]{2})[A-Za-z\d_.]+(?![_.])$/],
            errorMessage: "Username can only contain underscores, dots, and alphanumeric characters (usernames beginning/ending with underscores and dots, and/or containing a series of underscores and dots are not allowed)."
          },
          errorMessage: "Username is required."
        }
      });
    } else {
      req.checkBody({
        "email": {
          notEmpty: true,
          isEmail: {
            errorMessage: "Email address provided is not valid."
          },
          isEmailAvailable: {
            errorMessage: "Email address is not available. Please choose another one."
          },
          errorMessage: "Email address is required."
        }
      });
    }
    req.getValidationResult().then(function(result) {
      var errors = result.useFirstErrorOnly().array();
      if(errors.length !== 0) {
        res.render("update", {
          errors: errors,
          title: "Gradesheet - Change " + capitalizedField,
          updateField: updateField,
          currentValue: req.user[updateField],
          newValue: req.body[updateField]
        });
      } else {
        // username and email are different cases
        if(isUsername) {
          User.update({username: req.user.username}, {
            username: req.body.username
          }, function(err, doc) {
            if(err) throw err;
            req.flash("success_msg", capitalizedField + " successfully updated.");
            res.redirect("/users/settings/update/username");
          });
        } else {
          User.update({email: req.user.email}, {
            email: req.body.email
          }, function(err, doc) {
            if(err) throw err;
            req.flash("success_msg", capitalizedField + " successfully updated.");
            res.redirect("/users/settings/update/email");
          });
        }
      }
    });
  }
});

module.exports = router;
