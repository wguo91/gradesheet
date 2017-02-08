"use strict";
var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var globalFunctions = require("../controllers/globalFunctions");

// initialize global functions
var ensureAuth = globalFunctions.ensureAuth;
var ensureAdmin = globalFunctions.ensureAdmin;
var capitalize = globalFunctions.capitalize;
var compLastName = globalFunctions.compLastName;
var registrationValidation = globalFunctions.registrationValidation;

// GET student page
router.get("/:type", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.type;
  if(operation.charAt(0) === "a") {
    // add student page
    res.render("student", {
      title: "Gradesheet - Add Students",
      operation: operation,
      isAdd: true,
      isRemove: false
    });
  } else if(operation.charAt(0) === "r") {
    // remove student page
    User.find({admin: false}, function(err, students) {
      if(err) throw err;
      res.render("student", {
        title: "Gradesheet - Remove Students",
        operation: operation,
        isAdd: false,
        isRemove: true,
        students: students
      });
    });
  } else {
    // view students
    User.find({admin: false}, function(err, students) {
      students.sort(compLastName);
      res.render("student", {
        title: "Gradesheet - View Students",
        operation: operation,
        isAdd: false,
        isRemove: false,
        students: students
      });
    });
  }
});

// POST add or remove student
router.post("/:type", function(req, res) {
  var operation = req.params.type;
  if(operation.charAt(0) === "a") {
    // add a student
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    req = registrationValidation(req, res);
    req.getValidationResult().then(function(result) {
      var user, base64data, bmPath;
      var gender = req.body.gender;
      var errors = result.useFirstErrorOnly().array();
      if(errors.length !== 0) {
        operation = capitalize(operation);
        // "remember" what the user entered
        res.render("register", {
          title: "Gradesheet - "+operation+" Students",
          errors: errors,
          operation: operation,
          isAdd: true,
          isRemove: false,
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
        req.flash("success_msg", firstName +
          " " + lastName + " is successfully registered and can now login.");
        res.redirect("/users/students/add");
      }
    });
  } else {
    // remove a student, first check to see if any students were selected
    var idList = [];
    if(Object.getOwnPropertyNames(req.body).length > 0) {
      for(var prop in req.body) {
        idList.push(prop);
      }
      // remove all assignments associated with the student
      for(var i = 0; i < idList.length; i++) {
        var id = idList[i];
        (function(id) {
          User.remove({_id: id}, function(err) {
            if(err) throw err;
          })
          Assignment.remove({"completedBy.studentId": id}, function(err) {
            if(err) throw err;
          });
        })(id);
      }
      req.flash("success_msg", "Student(s) removed successfully.");
      res.redirect("/users/students/remove");
    } else {
      req.flash("error_msg", "No students were selected to remove.");
      res.redirect("/users/students/remove");
    }
  }
});

module.exports = router;
