let db;

// create a new db request for a "budget" database. this includes the version number (1, in this case)
const request = indexedDB.open("budget", 2);

request.onupgradeneeded = function(event) {
    // create object store called "pending" and set autoIncrement to true (meaning the primary key will auto increment)
    // called pending because when offline, these transactions will be 'pending' until the user is back online
    const db = event.target.result;
db.createObjectStore("pending", {
        autoIncrement: true
    });
};

// runs after the above upgrade of creating the object store when the db is created
//or if/when a new version is created
request.onsuccess = function(event) {
    db = event.target.result;
      // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};
//if there's an error, log a message to the console
request.onerror = function(event) {
    console.log("Uh-oh! " + event.target.errorCode);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
  
    // access the pending object store
    const store = transaction.objectStore("pending");
  
    // add record to your store with add method.
    store.add(record);
  }

  function checkDatabase() {
    // open a transaction on the pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access the pending object store
    const store = transaction.objectStore("pending");
    // get all records from store and set to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          }
        })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on the pending db
          const transaction = db.transaction(["pending"], "readwrite");
  
          // access the pending object store
          const store = transaction.objectStore("pending");
  
          // clear all items in the store
          store.clear();
        });
      }
    };
  }

  // listen for app coming back online
window.addEventListener("online", checkDatabase);
