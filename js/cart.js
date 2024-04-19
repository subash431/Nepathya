DB.onInitialized(function () {
  populateCart();
});

function populateCart() {
  document.getElementById("loader").style.display = "flex";
  const cartList = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  cartList.innerHTML = "";
  DB.getCartItemsByUsername(user.username, function (products) {
    if (products) {
      if (products.length == 0) {
        document.getElementById("loader").style.display = "none";
        return;
      }
      let subTotal = 0;
      let total = 0;
      products.forEach((item) => {
        subTotal += item.product.price * item.quantity;
        const product = document.createElement("div");
        product.classList.add("product-item");
        product.innerHTML = `<img class="product-image" src="img/products/${
          item.product.image
        }" alt="Product Image" />
        <div class="product-details">
          <div class="product-info">
            <h1 class="product-name">${item.product.name}</h1>
            <p class="product-quantity">Quantity: ${item.quantity}</p>
            <p class="product-total">Price: ${
              item.product.price
            } | Total: ${parseFloat(item.quantity * item.product.price).toFixed(
          2
        )}</p>
          </div>
          <div class="product-controls">
          <button  onclick="removeFromCart(${
            item.product.id
          })" class="p-btn icon outline error rounded decrease">
            -
          </button>
            <h1 class="quantity">${item.quantity}</h1>
            <button onclick="addToCart(${
              item.product.id
            })" class="p-btn icon outline rounded increase">+</button>
            
          </div>
        </div>`;
        cartList.append(product);
        setTimeout(() => {
          document.getElementById("loader").style.display = "none";
        }, 2000);
      });

      if (subTotal > 0) {
        total = subTotal + subTotal * (0.13 + 0.1) + 50;
        console.log(total);
        document.getElementById("subTotalPrice").innerText = `CAD $${parseFloat(
          subTotal
        ).toFixed(2)}`;
        document.getElementById("totalTax").innerText = `CAD $${parseFloat(
          subTotal * 0.13
        ).toFixed(2)}`;
        document.getElementById("serviceCharge").innerText = `CAD $${parseFloat(
          subTotal * 0.1
        ).toFixed(2)}`;
        document.getElementById("finalAmount").innerText = `CAD $${parseFloat(
          total
        ).toFixed(2)}`;
        cartSummary.style.display = "flex";
      }
    } else {
      console.log("Error loading products");
    }
  });
}

function addToCart(productId) {
  DB.addToCart(
    user.username,
    productId,
    function (success) {
      var cartItemCount = document.getElementById("cartItemCount");
      if (cartItemCount.innerText != "") {
        let count = cartItemCount.innerText.substring(
          1,
          cartItemCount.innerText.length - 1
        );
        count++;
        cartItemCount.innerText = `(${count})`;
      } else {
        cartItemCount.innerText = `(1)`;
      }
      showToast("s", success);
      populateCart();
    },
    function (error) {
      showToast("e", error);
    }
  );
}

function removeFromCart(productId) {
  DB.removeFromCart(
    user.username,
    productId,
    function (success) {
      var cartItemCount = document.getElementById("cartItemCount");
      if (cartItemCount.innerText != "") {
        let count = cartItemCount.innerText.substring(
          1,
          cartItemCount.innerText.length - 1
        );
        count--;
        cartItemCount.innerText = `(${count})`;
      } else {
        cartItemCount.innerText = ``;
      }
      showToast("s", success);
      populateCart();
    },
    function (error) {
      showToast("e", error);
    }
  );
}
