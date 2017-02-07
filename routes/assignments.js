"use strict";
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var globalFunctions = require("../controllers/globalFunctions");

// initialize the global functions
var ensureAuth = globalFunctions.ensureAuth;
var ensureAdmin = globalFunctions.ensureAdmin;
var compLastName = globalFunctions.compLastName;
var compLastNameInAsgt = globalFunctions.compLastNameInAsgt;

const TWO = 2;
const ONE_HUNDRED = 100;

/**
 * Helper function that takes in the array of assignment objects
 * and calculates the average score for that particular assignment;
 * please note the method is used for an assignment of the same name,
 * called once every time a new Assignment is created
 */
function calculateAverageGrade(asgtArray, totalPoints) {
  var sum = 0, grade, average;
  for(var i = 0; i < asgtArray.length; i++) {
    grade = (asgtArray[i].score) / totalPoints;
    sum += grade;
  }
  average = sum / (asgtArray.length);
  return average * ONE_HUNDRED;
}

/**
 * Construct asgt objects based on the student ids and their
 * corresponding scores; these asgt objects will then be pushed into an
 * array which will then be passed into mongoose for a batch insert
 */
function constructAsgtArray(students, requestBody, asgtName) {
  var arr = [], lookupStr, score, grade, studentId;
  for(var i = 0; i < students.length; i++) {
    // construct lookup string
    studentId = students[i]._id;
    score = requestBody[studentId];
    grade = ((score / (requestBody.totalPoints)) * ONE_HUNDRED).toFixed(2);
    // if score field is left blank, default value is zero
    if(score.trim() === "") score = 0;
    else Number.parseFloat(score);
    console.log(students[i].firstName + " " + students[i].lastName);
    console.log("completedBy object _id is " + students[i]._id);
    arr.push({
      name: asgtName,
      completedBy: {
        studentId: students[i]._id,
        firstName: students[i].firstName,
        lastName: students[i].lastName
      },
      score: score,
      grade: grade
    });
  }
  return arr.sort(compLastNameInAsgt);
}

/**
 * Construct a Collection object to hold statistical information
 * about a certain assignment, check collection.js for Schema infor
 */
function constructCollection(asgtArray, requestBody, asgtName) {
  var list = [];
  var totalPoints = requestBody.totalPoints;
  // we need the ObjectIds of all assignments with name asgtName
  Assignment.find({name: asgtName}, function(err, asgts) {
    for(var i = 0; i < asgts.length; i++) {
      list.push(asgts[i]._id);
    }
    var average = calculateAverageGrade(asgtArray, totalPoints);
    var collection = new Collection({
      name: asgtName,
      gradeAverage: average,
      gradePercentage: requestBody.gradePercentage,
      totalPoints: totalPoints,
      asgtList: list
    });
    collection.save(function(err, docs) {
      if(err) throw err;
    });
  });
}

router.get("/:operation", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.operation;
  User.find({admin: false}, function(err, students) {
    if(err) throw err;
    students.sort(compLastName);
    if(operation.charAt(0) === "a") {
      // add asgt page
      res.render("assignment", {
        operation: operation,
        isAdd: true,
        isRemove: false,
        students: students
      });
    } else if(operation.charAt(0) === "r") {
      // remove assignment page
      Collection.find({}, function(err, collections) {
        res.render("assignment", {
          operation: operation,
          isAdd: false,
          isRemove: true,
          collections: collections
        });
      });
    } else {
      // display all assignments
      Collection.find({})
      .populate("asgtList")
      .exec(function(err, collection) {
        if(err) throw err;
        var asgtListArr = [];
        var gradeAverageArr = [];
        var gradePercentageArr = [];
        var asgtNameArr = [];
        var totalPointsArr = [];
        for(var i = 0; i < collection.length; i++) {
          if(collection[i].asgtList.length > 0) {
            asgtListArr.push(collection[i].asgtList);
            asgtNameArr.push(collection[i].name);
            gradeAverageArr.push(collection[i].gradeAverage.toFixed(2));
            gradePercentageArr.push(collection[i].gradePercentage);
            totalPointsArr.push(collection[i].totalPoints);
          }
        }
        res.render("assignment", {
          operation: operation,
          isAdd: false,
          isRemove: false,
          asgtNameArr: asgtNameArr,
          gradeAverageArr: gradeAverageArr,
          gradePercentageArr: gradePercentageArr,
          asgtListArr: asgtListArr,
          totalPointsArr: totalPointsArr
        });
      });
    }
  })
});

router.post("/:operation", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.operation;
  if(operation.charAt(0) === "a") {
    // add assignment
    User.find({admin: false}, function(err, students) {
      if(err) throw err;
      var asgtName = req.body.asgtName.trim();
      var scores = {}, _id;
      for(var i = 0; i < students.length; i++) {
        _id = students[i]._id;
        scores[_id] = req.body[_id];
      }
      // form validation
      req.checkBody({
        "asgtName": {
          notEmpty: true,
          isLength: {
            options: [{max: 100}],
            errorMessage: "Assignment name must not exceed 100 characters."
          },
          isAsgtNameAvailable: {
            errorMessage: "An assignment with the name \"" + asgtName + "\" already exists. Please choose another one."
          },
          errorMessage: "Please enter an assignment name"
        },
        "gradePercentage": {
          notEmpty: true,
          isLength: {
            options: [{min: 0, max: 100}],
            errorMessage: "Grade percentages can only be between 0 and 100."
          },
          errorMessage: "Please enter the assignment's grade percentage"
        },
        "totalPoints": {
          notEmpty: true,
          isLength: {
            options: [{min: 0, max: 999}],
            errorMessage: "Total scores can only be between 0 and 999."
          },
          errorMessage: "Please enter the total possible score for the assignment."
        }
      });
      req.getValidationResult().then(function(result) {
        var errors = result.useFirstErrorOnly().array();
        if(errors.length !== 0) {
          res.render("assignment", {
            errors: errors,
            operation: operation,
            isAdd: true,
            students: students,
            scores: scores,
            asgtName: asgtName,
            gradePercentage: req.body.gradePercentage,
            totalPoints: req.body.totalPoints
          });
        } else {
          var asgtArray = constructAsgtArray(students, req.body,
            asgtName);
          // batch insert assignments
          Assignment.insertMany(asgtArray, function(err, docs) {
            if(err) throw err;
            constructCollection(asgtArray, req.body, asgtName);
          });
          req.flash("success_msg", "Assignment with name \"" +
            asgtName + "\" successfully added.");
          res.redirect("/users/assignments/add");
        }
      });
    });
  } else {
    // remove asgt, check to see if any asgts were selected
    if(Object.getOwnPropertyNames(req.body).length > 0) {
      var idList = [];
      for(var prop in req.body) {
        idList.push(prop);
      }
      for(var i = 0; i < idList.length; i++) {
        var id = idList[i];
        (function(id) {
          Collection.findOne({_id: id}, function(err, collection) {
            Assignment.remove({name: collection.name}, function(err) {
              if(err) throw err;
            });
            Collection.remove({_id: id}, function(err) {
              if(err) throw err;
            });
          })
        })(id);
      }
      req.flash("success_msg", "Assignment(s) removed successfully.");
      res.redirect("/users/assignments/remove");
    } else {
      req.flash("error_msg", "No assignments were selected to remove.");
      res.redirect("/users/assignments/remove");
    }
  }
});

module.exports = router;
