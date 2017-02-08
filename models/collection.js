"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CollectionSchema = Schema({
  name: {
    type: String,
    required: true
  },
  average: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  asgtList: [{
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  }]
});

var Collection = mongoose.model("Collection", CollectionSchema);
module.exports = Collection;
