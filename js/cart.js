DB.onInitialized(function () {
  populateCart();
});

function populateCart() {
  document.getElementById("loader").style.display = "flex";
  const cartList = document.getElementById("cartItems");
  console.log(user.username);
  DB.getCartItemsByUsername(user.username, function (products) {
    if (products) {
      products.forEach((item) => {
        const product = document.createElement("div");
        product.classList.add("product-item");
        product.innerHTML = `<img class="product-image" src="img/products/${
          item.product.image
        }" alt="Product Image" />
        <div class="product-details">
          <div class="product-info">
            <h1 class="product-name">${item.product.name}</h1>
            <p class="product-quantity">Quantity: ${item.quantity}</p>
            <p class="product-total">Total: <b>${
              item.quantity * item.product.price
            }</b></p>
          </div>
          <div class="product-controls">
            <button class="p-btn icon outline rounded increase">+</button>
            <h1 class="quantity">${item.quantity}</h1>
            <button class="p-btn icon outline error rounded decrease">
              -
            </button>
          </div>
        </div>`;
        cartList.append(product);
        setTimeout(() => {
          document.getElementById("loader").style.display = "none";
        }, 2000);
      });
    } else {
      console.log("Error loading products");
    }
  });
}
