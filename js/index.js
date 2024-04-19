var user = null;

DB.onInitialized(function () {
  checkUser();
});

function checkUser() {
  const luser = localStorage.getItem("user") ?? null;
  if (luser) {
    // Replace the login with username:
    const jsonUser = JSON.parse(luser);
    user = jsonUser;
    const userIcon = document.getElementById("userAccount");
    userIcon.innerHTML = jsonUser.username;
    userIcon.style.fontWeight = 700;
    userIcon.style.borderBottom = "2px solid white";

    DB.cartItemCount(user.username, function (callback) {
      console.log(callback);
      if (callback != null) {
        cartItemCount.innerText = `(${callback})`;
      }
    });
  }
}

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
