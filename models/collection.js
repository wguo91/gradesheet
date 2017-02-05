"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CollectionSchema = Schema({
  name: {
    type: String,
    required: true
  },
  gradeAverage: {
    type: Number,
    required: true
  },
  gradePercentage: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  asgtList: [{
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  }]
},
{
  timestamps: true
});

var Collection = mongoose.model("Collection", CollectionSchema);
module.exports = Collection;
