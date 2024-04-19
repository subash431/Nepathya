DB.onInitialized(function () {
  populateProduct();
});

function populateProduct() {
  document.getElementById("loader").style.display = "flex";
  const productsList = document.getElementById("productsList");
  DB.getProducts(function (products) {
    if (products) {
      products.forEach((item) => {
        const product = document.createElement("div");
        product.classList.add("products__main");

        let rate = "";
        for (i = 0; i < 5; i++) {
          if (item.rate > i) {
            rate += '<i class="fa-solid fa-star"></i>';
          } else {
            rate += '<i class="fa-regular fa-star"></i>';
          }
        }
        product.innerHTML = `<div class="product__main--img">
        <img src="./img/products/${item.image}" alt="${item.image}" />
      </div>
      <div class="product__main--text">
        <h2>${item.name}</h2>
        <p>CAD $${item.price}</p>
        <div class="product__rating">
          ${rate}
        </div>
        <button class="p-btn outline rounded">Add To Cart</button>
      </div>`;
        productsList.append(product);
        setTimeout(() => {
          document.getElementById("loader").style.display = "none";
        }, 2000);
      });
    } else {
      console.log("Error loading products");
    }
  });
}
