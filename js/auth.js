function checkUser() {
  const user = localStorage.getItem("user") ?? null;
  if (user) {
    window.location.href = "index.html";
  }
}

checkUser();

function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  if (!username || !password) {
    showToast("e", "Please fill out every fields.");
    return;
  }
  DB.login(username, password, function (user) {
    if (user) {
      // User logged in successfully
      localStorage.setItem("user", JSON.stringify(user));
      showToast("s", "Successfully logged in.");
      setTimeout(() => {
        // Take you to the home page.
        window.location.href = "index.html";
      }, 1000);
    } else {
      // User not found or password doesn't match
      showToast("e", "Sorry, user with this credentials doesn't exist.");
    }
  });
}

function signup() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var confirmpassword = document.getElementById("confirmpassword").value;
  var email = document.getElementById("email").value;

  if (!username || !password || !confirmpassword) {
    showToast("e", "Please fill out every fields.");
    return;
  }

  if (password != confirmpassword) {
    showToast("e", "Password doesn't match");
    return;
  }

  DB.signup(username, email, password, function (callback) {
    if (callback) {
      showToast("s", "Successfully register as a user.");
      setTimeout(() => {
        // Take you to the login page.
        window.location.href = "login.html";
      }, 1000);
    } else {
      showToast("e", "Sorry, some error occured while registering.");
    }
  });
}
