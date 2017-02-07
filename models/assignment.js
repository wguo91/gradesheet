"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AssignmentSchema = Schema({
  completedBy: {
    studentId: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true
  },
  grade: {
    type: Number,
    required: true
  }
},
{
  timestamps: true
});

var Assignment = mongoose.model("Assignment", AssignmentSchema);
module.exports = Assignment;

module.exports.removeAssignment = function(id) {
  console.log("id is " + id);
  Assignment.find().populate("completedBy._id").exec(function(err, asgt) {
    Assignment.remove({completedBy: {_id: id}}, function(err, removed) {
      if(err) throw err;
      console.log("whatever");
      console.log(JSON.stringify(removed, null, "\t"));
    });
  });
};
