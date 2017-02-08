"use strict";
var mongoose = require("mongoose");
var User = require("../models/user");
var Assignment = require("../models/assignment");
var Collection = require("../models/collection");
var fs = require("fs");
var path = require("path");

module.exports.initialize = function() {
  // initialize seed data
  var male = fs.readFileSync(path.join(__dirname,
    "/../public/images/male.png"));
  var female = fs.readFileSync(path.join(__dirname,
    "/../public/images/female.png"));
  var base64male = male.toString("base64");
  var base64female = female.toString("base64");
  var firstName = [
    "Kelly", "Timothy", "Victor", "Virginia", "Wanda",
    "Arthur", "Jesse", "Howard", "James", "Theresa"
  ];
  var lastName = [
    "Knight", "Campbell", "Wood", "Rodriguez", "Scott",
    "Payne", "Moreno", "Price", "Wang", "Harper"
  ];
  var email = [
    "kknight@yahoo.com", "tcampbello@sina.com", "vwood@sciencedirect.com",
    "vrodriguez99@gmail.com", "wscottr@aol.com", "apaynes@house.gov",
    "jmoreno@whitehouse.gov", "hprice@gmail.com", "jwang98@sina.com",
    "tharper@dagondesign.com"
  ];
  var gender = [
    "Female", "Male", "Male", "Female", "Female", "Male", "Male",
    "Male", "Male", "Female"
  ];
  var username = [
    "kknight", "tcampbello", "vwoodz", "rodriguezx", "ihatescottrade",
    "paynehouse", "morenomoreno", "priceisnotright", "sinawang",
    "deharperdesign"
  ];
  var password = [
    "Kknight9", "Tcampbello9", "Vwoodz9", "Rodriguezx9", "Ihatescottrade88",
    "Paynehouse9", "Morenomoreno9", "Priceisnotright9", "Sinawang9",
    "Deharperdesign9"
  ];
  for(var i = 0; i < firstName.length; i++) {
    var data = gender[i] === "Male" ? base64male : base64female;
    (function(i) {
      var user = User({
        firstName: firstName[i],
        lastName: lastName[i],
        gender: gender[i],
        email: email[i],
        username: username[i],
        password: password[i],
        avatar: {
          img: {
            encodedData: data,
            mimetype: "image/png"
          }
        },
        admin: false
      });
      User.createUser(user, function(err, user) {
        if(err) throw new Error("Seed data initialization failed.");
      });
    })(i);
  }
  // create an administrator account
  var user = User({
    firstName: "Wilson",
    lastName: "Guo",
    gender: "Male",
    email: "wguo@gmail.com",
    username: "wguo91",
    password: "Wguo91",
    avatar: {
      img: {
        encodedData: base64male,
        mimetype: "image/png"
      }
    },
    admin: true
  });
  User.createUser(user, function(err, user) {
    if(err) throw new Error("Seed data initialization failed.");
  });
  console.log("Database successfully initialized.");
};

module.exports.restart = function() {
  Collection.remove({}, function(err) {
    if(err) throw new Error("clearDatabase() failed.");
    console.log("Successfully cleared Collections");
  });
  Assignment.remove({}, function(err) {
    if(err) throw new Error("clearDatabase() failed.");
    console.log("Successfully cleared Assignments.");
  });
  User.remove({}, function(err) {
    if(err) throw new Error("clearDatabase() failed.");
    console.log("Successfully cleared Users.");
  });
};
