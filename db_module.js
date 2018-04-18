const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

class DatabaseModule {
  constructor() {
    let password = "v1LpAdxullM8Z8gY";
    let username = 'test_user';
    this.url = "mongodb+srv://" + username + ":" + password + "@noyou-4k2c1.mongodb.net/test";
    // defaults
    this.dbName = "test2";
    this.collectionName = "documents";
    
    this.contractDbName = "test";
    this.contractCollectionName = "contracts";
  }

  _connectDb(callback) {
    var dbName = this.dbName;
    var collectionName = this.collectionName;
    console.log("Attempting to connect to " + dbName + ":" + collectionName);

    MongoClient.connect(this.url, function(err, client) {
      assert.equal(null, err);

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      console.log("Successfully connected to database");
      callback(collection);
      client.close();
      console.log("Database connection closed");
    });
  }

  _connectContractDb(callback) {
    var dbName = this.contractDbName;
    var collectionName = this.contractCollectionName;
    console.log("Attempting to connect to " + dbName + ":" + collectionName);

    MongoClient.connect(this.url, function(err, client) {
      assert.equal(null, err);

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      console.log("Successfully connected to database");
      callback(collection);
      client.close();
      console.log("Database connection closed");
    });
  }


  createUser(username, password, accountId, callback) {
    var record = {
      username: username,
      password: password,
      accountId: accountId
    };

    this._connectDb(function(collection) {
      collection.insert(record, function(err, result) {
        assert.equal(null, err);
        callback();
      });
    });
  }

  getAllUsers(callback) {
    this._connectDb(function(collection) {
      collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        callback(docs);
      });
    });
  }

  getUser(username, callback) {
    this._connectDb(function(collection) {
      collection.find({username: username}).toArray(function(err, docs) {
        assert.equal(err, null);
        callback(docs[0]); //first one should be suffice
      });
    });
  }

  userExists(username, callback) {
    this._connectDb(function(collection) {
      collection.find({username: username}).toArray(function(err, docs) {
        if (err != null || docs === undefined || docs.length == 0) {
          callback(false);
        }
        else {
          callback(true);
        }
      });
    });
  }

  contractExists(callback) {
    this._connectContractDb(function(collection) {
      collection.find({}).toArray(function(err, docs) {
        if (err != null || docs === undefined || docs.length == 0) {
          callback(false);
        }
        else {
          callback(true);
        }
      });
    });
  }

  fetchContractAddress(callback) {
    this._connectContractDb(function(collection) {
      collection.find({}).toArray(function(err, docs) {
        callback(docs[0].contract);
      });
    });
  }

  // some bug here
  setup(dbName, collectionName) {
    this.dbName = dbName;
    this.collectionName = collectionName;
    var testRecord = {
      username: "testuser",
      password: "testpass",
      accountId: "1"
    }

    this._connectDb(function(collection) {
      collection.insert(testRecord, function(err, result) {
        assert.equal(null, err);
        console.log("Initial record successfully inserted");
        collection.createIndex({ username: 1 }, { unique: true }, function(err, results) {
          assert.equal(err, null);
        });
      });
    });
  }
}

module.exports = DatabaseModule;
