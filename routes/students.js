"use strict";
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var path = require("path");
var fs = require("fs");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var globalFunctions = require("../controllers/globalFunctions");

var ensureAuth = globalFunctions.ensureAuth;
var ensureAdmin = globalFunctions.ensureAdmin;
var capitalize = globalFunctions.capitalize;
var compLastName = globalFunctions.compLastName;
var registrationValidation = globalFunctions.registrationValidation;

router.get("/:type", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.type;
  if(operation.charAt(0) === "a") {
    // add student page
    res.render("student", {
      operation: operation,
      isAdd: true,
      isRemove: false
    });
  } else if(operation.charAt(0) === "r") {
    User.find({admin: false}, function(err, students) {
      if(err) throw err;
      // remove student page
      res.render("student", {
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
        operation: operation,
        isAdd: false,
        isRemove: false,
        students: students
      });
    });
  }
});

router.post("/:type", function(req, res) {
  var operation = req.params.type;
  if(operation.charAt(0) === "a") {
    // add a student
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    req = registrationValidation(req, res);
    req.getValidationResult().then(function(result) {
      var newUser, base64data, bitmap;
      var gender = req.body.gender;
      var errors = result.useFirstErrorOnly().array();
      if(errors.length !== 0) {
        res.render("student", {
          errors: errors,
          operation: operation,
          isAdd: true,
          isRemove: false,
          firstName: firstName,
          lastName: lastName,
          email: req.body.email,
          username: req.body.username,
          male: gender === "male",
          female: gender === "female"
        });
      } else {
        // assign default avatar
        req.body.gender === "male" ?
          bitmap = fs.readFileSync(path.join(__dirname + "/../public/images/man-1.png")) :
          bitmap = fs.readFileSync(path.join(__dirname + "/../public/images/woman-1.png"));
        gender = capitalize(gender);
        base64data = bitmap.toString("base64");
        newUser = new User({
          firstName: firstName,
          lastName: lastName,
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
        req.flash("success_msg", firstName +
          " " + lastName + " is successfully registered and can now login.");
        res.redirect("/users/students/add");
      }
    });
  } else {
    // remove a student, check to see if any students were selected
    var idList = [];
    console.log(Object.getOwnPropertyNames(req.body));
    console.log(Object.getOwnPropertyNames(req.body).length);
    if(Object.getOwnPropertyNames(req.body).length > 0) {
      for(var prop in req.body) {
        idList.push(prop);
      }
      console.log("idList is " + idList);
      for(var i = 0; i < idList.length; i++) {
        var id = idList[i];
        (function(id) {
          console.log("inside IIFE: " + id);
          User.findOne({_id: id}, function(err, user) {
            if(err) throw err;
            User.remove({_id: id}, function(err) {
              if(err) throw err;
            });
            Assignment.remove({completedBy: {_id: id}}, function(err) {
              if(err) throw err;
            });
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
