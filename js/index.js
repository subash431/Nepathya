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
    userIcon.innerHTML = `
    <i class="fa-solid fa-right-from-bracket"></i>
    ${jsonUser.username}`;
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

function gotoCart() {
  if (user == null) {
    showToast("e", "You have to login to see your cart.");
    return;
  } else {
    window.location.href = "cart.html";
  }
}

function loginButtonClicked() {
  if (user != null) {
    showToast("s", "You have been logged out successfully.");
    localStorage.removeItem("user");
    window.location.reload();
    return;
  } else {
    window.location.href = "login.html";
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
var MenuItems = document.getElementById("MenuItems");

MenuItems.style.maxHeight = "0px";
function menutoggle() {
  if (MenuItems.style.maxHeight == "0px") {
    MenuItems.style.maxHeight = "200px";
  } else {
    MenuItems.style.maxHeight = "0px";
  }
}
