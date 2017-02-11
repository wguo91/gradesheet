// disable submission button after one click
"use strict";
window.onload = function() {
  var form = document.getElementsByTagName("form")[0];
  var btn = document.getElementsByClassName("submit-btn")[0];
  btn.addEventListener("click", function() {
    form.submit();
    btn.setAttribute("disabled", "true");
  }, false);
};
