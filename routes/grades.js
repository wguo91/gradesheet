"use strict";
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var globalFunctions = require("../controllers/globalFunctions");

// initialize global functions
var ensureAuth = globalFunctions.ensureAuth;
var ensureAdmin = globalFunctions.ensureAdmin;
var calcGrade = globalFunctions.calcGrade;
var getAvgArray = globalFunctions.getAvgArray;

router.get("/:id", ensureAuth, ensureAdmin, function(req, res) {
  var id = req.params.id;
  Assignment.find({"completedBy.studentId": id}, function(err, asgts) {
    if(err)
      throw new Error("Assignment.find('completedBy.studentId': id) failed.");
    if(asgts.length > 0) {
      Collection.find({}, function(err, collections) {
        if(err) throw new Error("Collection.find({}) failed.");
        var overallGrade = calcGrade(asgts);
        var avgArray = getAvgArray(collections);
        var firstName = asgts[0].completedBy.firstName;
        var lastName = asgts[0].completedBy.lastName;
        console.log("asgts " + asgts);
        res.render("grade", {
          firstName: firstName,
          lastName: lastName,
          asgts: asgts,
          avgArray: avgArray,
          overallGrade: overallGrade
        });
      });
    } else {
      res.render("grade");
    }
  });
});

module.exports = router;
