const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

const input = fs.readFileSync('AssToken.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':AssToken'].bytecode;
const abi = JSON.parse(output.contracts[':AssToken'].interface);


var web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');

function deployContract(from, abi, bytecode, args, callback) {
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

function getBalances(contract, addr1, addr2, addr3) {
  contract.methods.getBalance().call({from: owning_account}, function(error, result){
    console.log("total supply: " + result);
  });
  contract.methods.getBalance().call({from: addr1}, function(error, result){
    console.log("player1: " + result);
  });
  contract.methods.getBalance().call({from: addr2}, function(error, result){
    console.log("player2: " + result);
  });
  contract.methods.getBalance().call({from: addr3}, function(error, result){
    console.log("player3: " + result);
  });
}

function bless(contract, addr1, addr2, callback) {
  contract.methods.bless(addr2).send({from: addr1}, function(error, transactionHash){
    console.log("blessing went through..." + transactionHash);
    callback();
  });
}

web3.eth.getAccounts().then((allAccounts) => {
  owning_account = allAccounts[0];
  player1 = allAccounts[1];
  player2 = allAccounts[2];
  player3 = allAccounts[3];

  var supply = 100000;
  deployContract(owning_account, abi, bytecode, [supply], (contract) => {
    getBalances(contract, player1, player2, player3);

    bless(contract, owning_account, player1, () => {
      getBalances(contract, player1, player2, player3);
      bless(contract, owning_account, player2, () => {
        getBalances(contract, player1, player2, player3);
        bless(contract, player2, player3, () => {
          getBalances(contract, player1, player2, player3);
          bless(contract, player2, player3, () => {
            getBalances(contract, player1, player2, player3);
            bless(contract, player3, player2, () => {
              getBalances(contract, player1, player2, player3);
            });
          });
        });
      });
    });
  });
});
