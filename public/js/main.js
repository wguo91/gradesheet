"use strict";
window.onload = function() {
  document.getElementById("upload-avatar").addEventListener("click", uploadImage, false);
  document.getElementById("upload-avatar-form").addEventListener("change", function() {
    document.getElementById("upload-avatar-form").submit();
  }, false);
  function uploadImage(evt) {
    evt.preventDefault();
    document.getElementById("avatar").click();
  }
}
