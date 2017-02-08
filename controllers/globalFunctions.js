"use strict";
// guest user accesses a registered user's page
module.exports.ensureAuth = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  else {
    req.flash("error_msg", "You are not logged in.");
    res.redirect("/login");
  }
};

// non-admin user accesses an admin-only page
module.exports.ensureAdmin = function(req, res, next) {
  if(req.user.admin)
    return next();
  else {
    req.flash("error_msg", "You do not have permission to access this page.");
    res.redirect("/");
  }
};

module.exports.getAvgArray = function(collections) {
  var avgArray = [];
  for(var i = 0; i < collections.length; i++) {
    avgArray.push(collections[i].average.toFixed(2));
  }
  return avgArray;
};

// gradePercentage not implemented yet
module.exports.calcGrade = function(asgts, percentage) {
  var sum = 0;
  for(var i = 0; i < asgts.length; i++) {
    sum += asgts[i].grade;
  }
  return (sum / (asgts.length)).toFixed(2);
};

module.exports.compLastName = function(a, b) {
  var lastNameA = a.lastName.toLowerCase();
  var lastNameB = b.lastName.toLowerCase();
  if(lastNameA < lastNameB) return -1;
  else if(lastNameA > lastNameB) return 1;
  else return 0;
};

module.exports.compLastNameInAsgt = function(a, b) {
  var lastNameA = a.completedBy.lastName.toLowerCase();
  var lastNameB = b.completedBy.lastName.toLowerCase();
  if(lastNameA < lastNameB) return -1;
  else if(lastNameA > lastNameB) return 1;
  else return 0;
};

module.exports.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports.registrationValidation = function(req, res) {
  // validation by schema
  req.checkBody({
    "firstName": {
      notEmpty: true,
      isLength: {
        options: [{min: 2, max: 50}],
        errorMessage: "First name must be between 2 and 50 characters long."
      },
      matches: {
        options: [/^[A-Za-z,.'-]+$/],
        errorMessage: "First name can only contain commas, dots, "+
          "apostrophes, hyphens, and letters from the English alphabet."+
          "Whitespaces are not allowed."
      },
      errorMessage: "First name is required."
    },
    "lastName": {
      notEmpty: true,
      isLength: {
        options: [{min: 2, max: 50}],
        errorMessage: "Last name must be between 2 and 50 characters long."
      },
      matches: {
        options: [/^[A-Za-z,.'-]+$/],
        errorMessage: "First name can only contain commas, dots, "+
          "apostrophes, hyphens, and letters from the English alphabet."+
          "Whitespaces are not allowed."
      },
      errorMessage: "Last name is required." // parameter errorMessage
    },
    "gender": {
      notEmpty: true,
      errorMessage: "Gender is required."
    },
    "email": {
      notEmpty: true,
      isEmail: {
        errorMessage: "Email address provided is not valid."
      },
      isEmailAvailable: {
        errorMessage: "Email address is not available. "+
          "Please chooe another one."
      },
      errorMessage: "Email address is required."
    },
    "username": {
      notEmpty: true,
      isLength: {
        options: [{min: 6, max: 30}],
        errorMessage: "Username must be between 6 and 30 characters long."
      },
      isUsernameAvailable: {
        errorMessage: "Username is not available. Please choose another one."
      },
      matches: {
        options: [/^(?![_.])(?!.*[_.]{2})[A-Za-z\d_.]+(?![_.])$/],
        errorMessage: "Username can only contain underscores, dots, and "+
          "alphanumeric characters (usernames beginning/ending with "+
          "underscores and dots, and/or containing a series of underscores "+
          "and dots are not allowed)."
      },
      errorMessage: "Username is required."
    },
    "password": {
      notEmpty: true,
      isLength: {
        options: [{min: 6, max: 30}],
        errorMessage: "Password must be between 6 and 30 characters long."
      },
      matches: {
        options: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/],
        errorMessage: "Password must contain at least one uppercase letter "+
          "and one numeric symbol."
      },
      errorMessage: "Password is required."
    },
    "confirmPassword": {
      notEmpty: true,
      matches: {
        options: [req.body.password],
        errorMessage: "Passwords do not match."
      },
      errorMessage: "Please confirm your password."
    }
  });
  return req;
};
