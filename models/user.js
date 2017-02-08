"use strict";
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var UserSchema = Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  avatar: {
    img: {
      encodedData: String,
      mimetype: String
    }
  },
  admin: {
    type: Boolean,
    required: true
  }
},
{
  // assigns createdAt and updatedAt fields to schema
  timestamps: true
});

var User = mongoose.model("User", UserSchema);
module.exports = User;
module.exports.createUser = function(newUser, callback) {
  // generate a salt with 10 rounds
  bcrypt.genSalt(10, function(err, salt) {
    if(err) throw err;
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  User.findOne({username: username}, callback);
};

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
};

module.exports.comparePW = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    else callback(null, isMatch);
  });
};

module.exports.isCurrPW = function(username, candidatePassword, callback) {
  User.findOne({username: username}, function(err, user) {
    User.comparePW(candidatePassword, user.password, callback);
  });
};

module.exports.updatePW = function(username, candidatePassword, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(candidatePassword, salt, function(err, hash) {
      if(err) throw err;
      User.update({username: username}, {
        password: hash
      }, callback);
    });
  });
};

// obtain the five most recently registered students
module.exports.getFiveStudents = function(callback) {
  User.find({admin: false}, null, {sort: "-createdAt", limit: 5}, callback);
};
