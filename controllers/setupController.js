"use strict";
var mongoose = require("mongoose");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var fs = require("fs");
var path = require("path");

module.exports.initialize = function() {
  var bitmapMale = fs.readFileSync(path.join(__dirname + "/../public/images/man-1.png"));
  var bitmapFemale = fs.readFileSync(path.join(__dirname + "/../public/images/woman-1.png"));
  var base64dataMale = bitmapMale.toString("base64");
  var base64dataFemale = bitmapFemale.toString("base64");
/*
  var newUser = User({
    firstName: "Wilson",
    lastName: "Guo",
    gender: "Male",
    email: "wguo@gmail.com",
    username: "wguo91",
    password: "wguo91",
    avatar: {
      img: {
        encodedData: base64dataMale,
        mimetype: "image/png"
      }
    },
    admin: true
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Jackson",
    lastName: "Guo",
    gender: "Male",
    email: "jguo@gmail.com",
    username: "jguo93",
    password: "jguo93",
    avatar: {
      img: {
        encodedData: base64dataMale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Derrick",
    lastName: "Chang",
    gender: "Male",
    email: "dchang@gmail.com",
    username: "dchang",
    password: "dchang",
    avatar: {
      img: {
        encodedData: base64dataMale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Elizabeth",
    lastName: "Tran",
    gender: "Female",
    email: "etran@gmail.com",
    username: "etran",
    password: "etran",
    avatar: {
      img: {
        encodedData: base64dataFemale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Queenie",
    lastName: "Lau",
    gender: "Female",
    email: "qlau@gmail.com",
    username: "qlau92",
    password: "qlau92",
    avatar: {
      img: {
        encodedData: base64dataFemale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Kevin",
    lastName: "Ma",
    gender: "Male",
    email: "kma@gmail.com",
    username: "kma1992",
    password: "kma1992",
    avatar: {
      img: {
        encodedData: base64dataMale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Sarah",
    lastName: "Jung",
    gender: "Female",
    email: "sjung@gmail.com",
    username: "sjung92",
    password: "sjung92",
    avatar: {
      img: {
        encodedData: base64dataFemale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });

  newUser = User({
    firstName: "Riley",
    lastName: "Yeakle",
    gender: "Male",
    email: "ryeakle@gmail.com",
    username: "ryeakle",
    password: "ryeakle",
    avatar: {
      img: {
        encodedData: base64dataMale,
        mimetype: "image/png"
      }
    },
    admin: false
  });

  User.createUser(newUser, function(err, user) {
    if(err) throw err;
  });
  console.log("Successfully initialized database.");
  */
};

module.exports.clearDatabase = function() {
  /*
  Collection.remove({}, function(err) {
    if(err) throw err;
    console.log("Successfully cleared Collections");
  });
  Assignment.remove({}, function(err) {
    if(err) throw err;
    console.log("Successfully cleared Assignments.");
  });

  User.remove({}, function(err) {
    if(err) throw err;
    console.log("Successfully cleared Users.");
  });
  */
};
