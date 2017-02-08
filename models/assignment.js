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
