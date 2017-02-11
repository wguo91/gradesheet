"use strict";
window.onload = function() {
  var btn = document.getElementById("back-btn");
  btn.addEventListener("click", function(evt) {
    evt.preventDefault();
    location.href = "/users/settings";
  }, false);
};
