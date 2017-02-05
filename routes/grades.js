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

router.get("/:id", ensureAuth, ensureAdmin, function(req, res) {

});

module.exports = router;
