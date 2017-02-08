"use strict";
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");

passport.use(new LocalStrategy(function(username, password, done) {
  User.getUserByUsername(username, function(err, user) {
    if(err) return done(err);
    if(!user) return done(null, false, {message: "User does not exist."});
    User.comparePW(password, user.password, function(err, isMatch) {
      if(err) return done(err);
      // valid user object is passed along to trigger successRedirect
      // invalid authentication, pass an extra message along with callback
      if(!isMatch) return done(null, false, {
        message: "Username and password do not match."
      });
      return done(null, user);
    });
  });
}));

// determines which data of the user object should be stored in the session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// retrieve user object with the help of the key returned by the done function
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
