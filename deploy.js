const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

const input = fs.readFileSync('AssToken.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':AssToken'].bytecode;
const abi = JSON.parse(output.contracts[':AssToken'].interface);

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// million
const supply = 1000000;

var web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');

function deployContract(from, args, callback) {
  web3.eth.getCoinbase().then((coinbase) => {
    var assContract = new web3.eth.Contract(abi, undefined, {
      from: coinbase, 
      gasPrice: '20000000000'
    });

    assContract.deploy({
      data: bytecode,
      arguments: args
    }).send({
      from: from, 
      gas: 1500000,
      gasPrice: '30000000000000'
    }, function(error, transactionHash){
      console.log("Deployed contract");
      console.log(transactionHash);
    }).then(function(contractInstance){
      console.log(contractInstance.options.address) // instance with the new contract address
      callback(contractInstance);
    });
  });
}

web3.eth.getAccounts().then((allAccounts) => {
  owning_account = allAccounts[0];

  deployContract(owning_account, [supply], (contract) => {
    // save in db
    var record = {
      contract: contract.options.address
    }

    password = "v1LpAdxullM8Z8gY";
    username = 'test_user';
    url = "mongodb+srv://" + username + ":" + password + "@noyou-4k2c1.mongodb.net/test";
    dbName = "test6";
    collectionName = "contracts";

    console.log("Attempting to connect to " + dbName + ":" + collectionName);

    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      console.log("Successfully connected to database");
      collection.insert(record, function(err, result) {
        assert.equal(null, err);
        console.log("Contract saved");
        client.close();
        console.log("Database connection closed");
        process.exit();
      });
    });
  });
});
