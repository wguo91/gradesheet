"use strict";
var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var globalFunctions = require("../controllers/globalFunctions");

// initialize global functions
var ensureAuth = globalFunctions.ensureAuth;
var ensureAdmin = globalFunctions.ensureAdmin;
var compLastName = globalFunctions.compLastName;
var compLastNameInAsgt = globalFunctions.compLastNameInAsgt;

const ONE_HUNDRED = 100;

/**
 * Helper functions:
 * calcAverageGrade()
 * constructAsgtArr(),
 * constructCollection(),
 * constructScoresObj()
 */

/**
 * Helper function that takes in the array of assignment objects
 * and calculates the average score for that particular assignment;
 * please note the method is used for an assignment of the same name,
 * called once every time a new Assignment is created
 */
function calcAverageGrade(asgtArr, total) {
  var sum = 0, grade, average;
  for(var i = 0; i < asgtArr.length; i++) {
    grade = (asgtArr[i].score) / total;
    sum += grade;
  }
  average = sum / (asgtArr.length);
  return average * ONE_HUNDRED;
}

/**
 * Construct asgt objects based on the student ids and their
 * corresponding scores; these asgt objects will then be pushed into an
 * array which will then be passed into mongoose for a batch insert
 */
function constructAsgtArr(students, requestBody, asgtName) {
  var arr = [], score, grade, studentId;
  for(var i = 0; i < students.length; i++) {
    // construct lookup string
    studentId = students[i]._id;
    score = requestBody[studentId];
    grade = ((score / (requestBody.total)) * ONE_HUNDRED).toFixed(2);
    // if score field is left blank, default value is zero
    if(score.trim() === "") score = 0;
    else Number.parseFloat(score);
    arr.push({
      name: asgtName,
      completedBy: {
        studentId: studentId,
        firstName: students[i].firstName,
        lastName: students[i].lastName
      },
      score: score,
      grade: grade
    });
  }
  // return sorted array of asgt objects
  return arr.sort(compLastNameInAsgt);
}

/**
 * Construct a Collection object to hold statistical information
 * about a certain assignment, check collection.js for Schema infor
 */
function constructCollection(asgtArr, requestBody, asgtName) {
  var list = [], total = requestBody.total;
  // we need the ObjectIds of all assignments with name asgtName
  Assignment.find({name: asgtName}, function(err, asgts) {
    for(var i = 0; i < asgts.length; i++) {
      list.push(asgts[i]._id);
    }
    var average = calcAverageGrade(asgtArr, total);
    var collection = new Collection({
      name: asgtName,
      average: average,
      percentage: requestBody.percentage,
      total: total,
      asgtList: list
    });
    collection.save(function(err, docs) {
      if(err) throw err;
    });
  });
}

function constructScoresObj(students, requestBody) {
  var scores = {}, studentId;
  for(var i = 0; i < students.length; i++) {
    // create a score object with studentId keys and score values
    scores[studentId] = requestBody[students[i]._id];
  }
  return scores;
}

// GET assignments (add, remove, view)
router.get("/:operation", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.operation;
  User.find({admin: false}, function(err, students) {
    if(err) throw err;
    // sort students by last name before rendering
    students.sort(compLastName);
    if(operation.charAt(0) === "a") {
      // render add page
      res.render("assignment", {
        title: "Gradesheet - Add Assignments",
        operation: operation,
        isAdd: true,
        isRemove: false,
        students: students
      });
    } else if(operation.charAt(0) === "r") {
      // render remove page
      Collection.find({}, function(err, collections) {
        res.render("assignment", {
          title: "Gradesheet - Remove Assignments",
          operation: operation,
          isAdd: false,
          isRemove: true,
          collections: collections
        });
      });
    } else {
      // render view page
      Collection.find({})
      .populate("asgtList")
      .exec(function(err, collection) {
        if(err) throw err;
        var asgtListArr = [], averageArr = [], percentageArr = [],
          asgtNameArr = [], totalArr = [];
        // aggregate data for rendering
        for(var i = 0; i < collection.length; i++) {
          if(collection[i].asgtList.length > 0) {
            asgtListArr.push(collection[i].asgtList);
            asgtNameArr.push(collection[i].name);
            averageArr.push(collection[i].average.toFixed(2));
            percentageArr.push(collection[i].percentage);
            totalArr.push(collection[i].total);
          }
        }
        res.render("assignment", {
          title: "Gradesheet - View Assignments",
          operation: operation,
          isAdd: false,
          isRemove: false,
          asgtNameArr: asgtNameArr,
          averageArr: averageArr,
          percentageArr: percentageArr,
          asgtListArr: asgtListArr,
          totalArr: totalArr
        });
      });
    }
  })
});

// POST assignments add and remove
router.post("/:operation", ensureAuth, ensureAdmin, function(req, res) {
  var operation = req.params.operation;
  if(operation.charAt(0) === "a") {
    // add assignment
    User.find({admin: false}, function(err, students) {
      if(err) throw err;
      var asgtName = req.body.asgtName.trim();
      var scores = constructScoresObj(students, req.body);
      // form validation
      req.checkBody({
        "asgtName": {
          notEmpty: true,
          isLength: {
            options: [{max: 100}],
            errorMessage: "Assignment name must not exceed 100 characters."
          },
          isAsgtNameAvailable: {
            errorMessage: "An assignment with the name \"" + asgtName +
              "\" already exists. Please choose another one."
          },
          errorMessage: "Please enter an assignment name."
        },
        "percentage": {
          notEmpty: true,
          isLength: {
            options: [{min: 0, max: 100}],
            errorMessage: "Grade percentages can only be between 0 and 100."
          },
          errorMessage: "Please enter the assignment's grade percentage."
        },
        "total": {
          notEmpty: true,
          isLength: {
            options: [{min: 0, max: 999}],
            errorMessage: "Total scores can only be between 0 and 999."
          },
          errorMessage: "Please enter the maximum score for the assignment."
        }
      });
      // handle validation errors
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
            percentage: req.body.percentage,
            total: req.body.total
          });
        } else {
          // no validation errors
          var asgtArr = constructAsgtArr(students, req.body, asgtName);
          // batch insert assignments
          Assignment.insertMany(asgtArr, function(err, docs) {
            if(err) throw err;
            // construct one collection for every batch of assignments
            constructCollection(asgtArr, req.body, asgtName);
          });
          req.flash("success_msg", "Assignment with name \"" +
            asgtName + "\" successfully added.");
          res.redirect("/users/assignments/add");
        }
      });
    });
  } else {
    // remove assignment, first check to see if any assignments were selected
    if(Object.getOwnPropertyNames(req.body).length > 0) {
      // create an array of assignment ids
      var idList = [];
      for(var prop in req.body) {
        idList.push(prop);
      }
      // remove every assignment selected
      for(var i = 0; i < idList.length; i++) {
        var id = idList[i];
        (function(id) {
          Collection.findOne({_id: id}, function(err, collection) {
            Assignment.remove({name: collection.name}, function(err) {
              if(err) throw err;
            });
            // remove assignment's reference in its respective Collection
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
