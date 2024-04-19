function showToast(type, message) {
  if (type == "e") {
    document.getElementById("error-toast").style.display = "flex";
    document.getElementById("error-toast-text").innerHTML = message;
    setTimeout(() => {
      document.getElementById("error-toast").style.display = "none";
    }, 2000);
  }

  if (type == "s") {
    document.getElementById("success-toast").style.display = "flex";
    document.getElementById("success-toast-text").innerHTML = message;
    setTimeout(() => {
      document.getElementById("success-toast").style.display = "none";
    }, 2000);
  }
}
