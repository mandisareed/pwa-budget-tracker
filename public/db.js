let db;

// create a new db request for a "budget" database. this includes the version number (1, in this case)
const request = window.indexedDB.open("budget", 1);
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