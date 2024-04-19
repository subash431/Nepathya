function placeOrder() {
  DB.deleteCart(
    user.username,
    function (success) {
      window.location.href = "checkout.html";
    },
    function (error) {
      showToast("e", error);
    }
  );
}
function back() {
  window.location.href = "index.html";
}
