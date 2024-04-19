const DB = {
  initialized: false,

  // Function to initialize the database
  initialize: function () {
    console.log(this.initialized);
    if (!this.initialized) {
      const request = indexedDB.open("pastry_shop", 1);
      request.onupgradeneeded = this.handleUpgrade;
      request.onsuccess = this.handleSuccess;
      request.onerror = this.handleError;
    }
  },

  // Event handler for database upgrade
  handleUpgrade: function (event) {
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
    productObjectStore.createIndex("price", "price", { unique: false });
    productObjectStore.createIndex("description", "description", {
      unique: false,
    });

    DB.initialized = true;
  },

  // Event handler for successful database initialization
  handleSuccess: function (event) {
    DB.db = event.target.result;

    // Function to sign up a new user
    DB.signup = function (username, email, password) {
      const transaction = DB.db.transaction(["users"], "readwrite");
      const userObjectStore = transaction.objectStore("users");
      const user = { username, email, password };
      const request = userObjectStore.add(user);

      request.onsuccess = function (event) {
        console.log("User signed up successfully:", username);
      };

      request.onerror = function (event) {
        console.error("Error signing up user:", event.target.error);
      };
    };

    // Function to login a user
    DB.login = function (username, password, callback) {
      console.log(username, password);
      const transaction = DB.db.transaction(["users"], "readonly");
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
    };
  },

  // Event handler for database initialization error
  handleError: function (event) {
    console.error("Error opening database:", event.target.error);
  },
};

// Initialize the database only once
DB.initialize();
