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
var calcGrade = globalFunctions.calcGrade;
var getAvgArray = globalFunctions.getAvgArray;

// GET grades page
router.get("/:id", ensureAuth, ensureAdmin, function(req, res) {
  var id = req.params.id;
  Assignment.find({"completedBy.studentId": id}, function(err, asgts) {
    if(err)
      throw err;
    if(asgts.length > 0) {
      Collection.find({}, function(err, collections) {
        if(err) throw err;
        var overallGrade = calcGrade(asgts);
        var avgArray = getAvgArray(collections);
        var firstName = asgts[0].completedBy.firstName;
        var lastName = asgts[0].completedBy.lastName;
        res.render("grade", {
          title: "Gradesheet - Grades",
          firstName: firstName,
          lastName: lastName,
          asgts: asgts,
          avgArray: avgArray,
          overallGrade: overallGrade
        });
      });
    } else {
      User.findOne({_id: id}, function(err, user) {
        var firstName = user.firstName;
        var lastName = user.lastName;
        res.render("grade", {
          title: "Gradesheet - Grades",
          firstName: firstName,
          lastName: lastName
        });
      });
    }
  });
});

module.exports = router;
