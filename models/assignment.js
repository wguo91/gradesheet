"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AssignmentSchema = Schema({
  completedBy: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
