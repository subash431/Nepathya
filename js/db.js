const DB = {
  initialized: false,
  onInitializedCallbacks: [],

  initialize: function (predefinedProducts) {
    if (!this.initialized) {
      const request = indexedDB.open("pastry_shop", 1);
      request.onupgradeneeded = (event) =>
        this.handleUpgrade(event, predefinedProducts);
      request.onsuccess = (event) => this.handleSuccess(event);
      request.onerror = this.handleError;
    }
  },

  handleUpgrade: function (event, predefinedProducts) {
    const db = event.target.result;

    // Create 'users' table
    const userObjectStore = db.createObjectStore("users", {
      keyPath: "username",
    });
    userObjectStore.createIndex("email", "email", { unique: true });
    userObjectStore.createIndex("password", "password", { unique: true });

    // Create 'products' table
    const productObjectStore = db.createObjectStore("products", {
      keyPath: "id",
      autoIncrement: true,
    });
    productObjectStore.createIndex("name", "name", { unique: false });
    productObjectStore.createIndex("image", "image", { unique: false });
    productObjectStore.createIndex("rate", "rate", { unique: false });
    productObjectStore.createIndex("price", "price", { unique: false });
    productObjectStore.createIndex("description", "description", {
      unique: false,
    });

    // Create 'carts' table
    const cartObjectStore = db.createObjectStore("carts", {
      keyPath: "username",
      autoIncrement: true,
    });
    cartObjectStore.createIndex("productId", "productId", { unique: true });
    cartObjectStore.createIndex("quantity", "quantity", { unique: false });

    const transaction = event.target.transaction;
    const productStore = transaction.objectStore("products");
    predefinedProducts.forEach(function (product) {
      productStore.add(product);
    });
  },

  handleSuccess: function (event) {
    this.db = event.target.result;
    this.initialized = true;

    this.onInitializedCallbacks.forEach((callback) => callback());
    this.onInitializedCallbacks = [];
  },

  handleError: function (event) {
    console.error("Error opening database:", event.target.error);
  },

  // Register a callback to be called when the database is initialized
  onInitialized: function (callback) {
    if (this.initialized) {
      // If the database is already initialized, call the callback immediately
      callback();
    } else {
      // Otherwise, add the callback to the array
      this.onInitializedCallbacks.push(callback);
    }
  },

  signup: function (username, email, password, callback) {
    const transaction = this.db.transaction(["users"], "readwrite");
    const userObjectStore = transaction.objectStore("users");
    const user = { username, email, password };
    const request = userObjectStore.add(user);

    request.onsuccess = function (event) {
      console.log("User signed up successfully:", username);
      callback(true);
    };

    request.onerror = function (event) {
      callback(false);

      console.error("Error signing up user:", event.target.error);
    };
  },

  login: function (username, password, callback) {
    const transaction = this.db.transaction(["users"], "readonly");
    const userObjectStore = transaction.objectStore("users");
    const request = userObjectStore.get(username);

    request.onsuccess = function (event) {
      const user = event.target.result;
      if (user && user.password === password) {
        callback(user);
      } else {
        callback(null);
      }
    };

    request.onerror = function (event) {
      callback(null);
      console.error("Error logging in user:", event.target.error);
    };
  },

  getProducts: function (callback) {
    const transaction = this.db.transaction(["products"], "readonly");
    const productObjectStore = transaction.objectStore("products");
    const request = productObjectStore.openCursor();

    const allProducts = [];
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const product = cursor.value;
        allProducts.push(product);
        cursor.continue();
      } else {
        callback(allProducts);
      }
    };

    request.onerror = function (event) {
      callback(null);
      console.error("Error on loading products:", event.target.error);
    };
  },

  cartItemCount: function (username, callback) {
    const transaction = this.db.transaction(["carts"], "readonly");
    const cartObjectStore = transaction.objectStore("carts");
    const request = cartObjectStore.get(username);

    request.onsuccess = function (event) {
      const cart = event.target.result;
      if (cart) {
        let itemCount = 0;
        cart.products.forEach(function (product) {
          itemCount += product.quantity;
        });
        callback(itemCount);
      } else {
        // Cart doesn't exist for the username
        callback(null);
      }
    };

    request.onerror = function (event) {
      console.error("Error fetching cart:", event.target.error);
      callback(null);
    };
  },

  getItemQuantityInCart: function (username, productId, callback) {
    const transaction = this.db.transaction(["carts"], "readonly");
    const cartObjectStore = transaction.objectStore("carts");
    const request = cartObjectStore.get(username);

    request.onsuccess = function (event) {
      const cart = event.target.result;
      if (cart) {
        const product = cart.products.find((p) => p.productId === productId);
        if (product) {
          callback(product.quantity);
        } else {
          // Product not found in cart
          callback(0);
        }
      } else {
        // Cart doesn't exist for the username
        callback(0);
      }
    };

    request.onerror = function (event) {
      console.error("Error fetching cart:", event.target.error);
      callback(null);
    };
  },

  getCartItemsByUsername: function (username, callback) {
    const transaction = this.db.transaction(["carts"], "readonly");
    const cartObjectStore = transaction.objectStore("carts");
    const request = cartObjectStore.get(username);

    request.onsuccess = function (event) {
      console.log(event.target.result);
      const cart = event.target.result;
      if (cart) {
        // Fetch product details for each item in the cart
        const productDetails = [];
        const productTransaction = DB.db.transaction(["products"], "readonly");
        const productObjectStore = productTransaction.objectStore("products");
        cart.products.forEach(function (item) {
          const productRequest = productObjectStore.get(
            item.productId.toString()
          );
          productRequest.onsuccess = function (event) {
            const product = event.target.result;
            console.log(product);
            if (product) {
              productDetails.push({ product, quantity: item.quantity });
            }
          };
        });
        // Wait for all product requests to complete
        productTransaction.oncomplete = function () {
          callback(productDetails);
        };
      } else {
        // Cart doesn't exist for the username
        callback([]);
      }
    };

    request.onerror = function (event) {
      console.error("Error fetching cart:", event.target.error);
      callback(null);
    };
  },

  addToCart: function (username, productId, successCallback, errorCallback) {
    const transaction = this.db.transaction(["carts"], "readwrite");
    const cartObjectStore = transaction.objectStore("carts");
    const request = cartObjectStore.get(username);

    request.onsuccess = function (event) {
      const cart = event.target.result;
      if (cart) {
        // Cart exists, check if productId already exists
        const existingProduct = cart.products.find(
          (product) => product.productId === productId
        );
        if (existingProduct) {
          // Product already exists, increment quantity
          existingProduct.quantity++;
          // Update the cart in the database
          const updateRequest = cartObjectStore.put(cart);
          updateRequest.onsuccess = function (event) {
            if (typeof successCallback === "function") {
              successCallback("Product quanity in cart updated successfully.");
            }
          };
          updateRequest.onerror = function (event) {
            if (typeof errorCallback === "function") {
              errorCallback(
                "Error incrementing product quantity: " + event.target.error
              );
            }
          };
        } else {
          // Product doesn't exist, add it to the cart
          cart.products.push({ productId, quantity: 1 });
          // Update the cart in the database
          const updateRequest = cartObjectStore.put(cart);
          updateRequest.onsuccess = function (event) {
            if (typeof successCallback === "function") {
              successCallback("New product added to cart successfully.");
            }
          };
          updateRequest.onerror = function (event) {
            if (typeof errorCallback === "function") {
              errorCallback(
                "Error adding product to cart: " + event.target.error
              );
            }
          };
        }
      } else {
        // Cart doesn't exist, create a new one
        const newCart = { username, products: [{ productId, quantity: 1 }] };
        const addRequest = cartObjectStore.add(newCart);
        addRequest.onsuccess = function (event) {
          if (typeof successCallback === "function") {
            successCallback("New product added to cart successfully.");
          }
        };
        addRequest.onerror = function (event) {
          if (typeof errorCallback === "function") {
            errorCallback("Error creating new cart: " + event.target.error);
          }
        };
      }
    };

    request.onerror = function (event) {
      if (typeof errorCallback === "function") {
        errorCallback("Error fetching cart: " + event.target.error);
      }
    };
  },

  removeFromCart: function (
    username,
    productId,
    successCallback,
    errorCallback
  ) {
    const transaction = this.db.transaction(["carts"], "readwrite");
    const cartObjectStore = transaction.objectStore("carts");
    const request = cartObjectStore.get(username);

    request.onsuccess = function (event) {
      const cart = event.target.result;
      if (cart) {
        // Cart exists, find the product index in the cart
        const productIndex = cart.products.findIndex(
          (product) => product.productId === productId
        );
        if (productIndex !== -1) {
          // Product found in the cart, decrement its quantity
          const product = cart.products[productIndex];
          product.quantity--;
          if (product.quantity === 0) {
            // Remove the product from the cart if its quantity becomes zero
            cart.products.splice(productIndex, 1);
          }
          // Update the cart in the database
          const updateRequest = cartObjectStore.put(cart);
          updateRequest.onsuccess = function (event) {
            if (typeof successCallback === "function") {
              successCallback("Product removed from cart successfully.");
            }
          };
          updateRequest.onerror = function (event) {
            if (typeof errorCallback === "function") {
              errorCallback(
                "Error removing product from cart: " + event.target.error
              );
            }
          };
        } else {
          // Product not found in the cart
          if (typeof successCallback === "function") {
            successCallback("Product not found in the cart.");
          }
        }
      } else {
        // Cart doesn't exist
        if (typeof successCallback === "function") {
          successCallback("Cart not found for user: " + username);
        }
      }
    };

    request.onerror = function (event) {
      if (typeof errorCallback === "function") {
        errorCallback("Error fetching cart: " + event.target.error);
      }
    };
  },
};

const predefinedProducts = [
  {
    id: "1",
    name: "Spicy Patty",
    image: "product1.jpg",
    price: 22.00,
    rate: 4,
    description: "Description 1",
  },
  {
    id: "2",
    name: "TurnOver ",
    image: "product2.jpg",
    price: 3.5,
    rate: 5,
    description: "Description 2",
  },
  {
    id: "3",
    name: "White Hardo",
    image: "product3.jpg",
    price: 4.5,
    rate: 3,
    description: "Description 3",
  },
  {
    id: "4",
    name: "Chicken Patty",
    image: "product4.jpg",
    price: 20.5,
    rate: 5,
    description: "Description 4",
  },
  {
    id: "5",
    name: "Plantain Tart",
    image: "product5.png",
    price: 3.5,
    rate: 5,
    description: "Description 5",
  },

  {
    id: "6",
    name: "Bulla",
    image: "product6.webp",
    price: 4.5,
    rate: 4.5,
    description: "Description 6",
  },
  {
    id: "7",
    name: "Coconut razada",
    image: "product7.jpg",
    price: 2.5,
    rate: 4,
    description: "Description 7",
  },
  {
    id: "8",
    name: "Soft Bread",
    image: "product8.jpg",
    price: 1.5,
    rate: 4.5,
    description: "Description 8",
  },
  {
    id: "9",
    name: "PegBread",
    image: "product9.jpeg",
    price: 1.9,
    rate: 3.9,
    description: "Description 9",
  },
];

DB.initialize(predefinedProducts);
