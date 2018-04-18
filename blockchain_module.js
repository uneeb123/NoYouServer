const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

const input = fs.readFileSync('AssToken.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':AssToken'].bytecode;
const abi = JSON.parse(output.contracts[':AssToken'].interface);

var web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');

class BlockchainModule {
  constructor(_contractAddress) {
    this.contract = new web3.eth.Contract(abi, _contractAddress);
  }

  createAccount(password, callback) {
    var account = web3.eth.accounts.create();
    var address = account.address;
    var privateKey = account.privateKey;
    web3.eth.personal.importRawKey(privateKey, password);
    this.getBenefactorAccount((from) => {
      web3.eth.sendTransaction({from: from,to: address, value:web3.utils.toWei('0.1', "ether")});
      console.log("Ready to use new account");
      callback(address);
    });
  }

  getBalance(address, callback) {
    this.contract.methods.getBalance().call({from: address}, function(error, result){
      callback(result);
    });
  }

  getGodAccount(callback) {
    web3.eth.getAccounts().then((response) => {
      callback(response[0]);
    });
  }

  getBenefactorAccount(callback) {
    var sent = false
    web3.eth.getAccounts().then((response) => {
      for (var i = 1; i < 10; i++) {
        addr = response[i];
        web3.eth.getBalance(addr).then((b) => {
          console.log("Benefactor: " + addr + " has balance " + b);
          if (parseInt(b) > web3.utils.toWei('1', "ether")) {
            console.log("Benefactor chosen " + addr);
            if (!sent) {
              callback(addr);
              sent = true;
            }
          }
        });
      }
    });
  }

  send(from, password, to, callback) {
    console.log("from: " + from + " to: " + to);
    web3.eth.personal.unlockAccount(from, password, 1000).then((response) => {
      console.log(response);
      this.contract.methods.bless(to).send({from: from}, function(error, transactionHash){
        console.log(error);
        console.log("blessing went through..." + transactionHash);
        callback();
      });
    }).catch((error) => {
      console.log(error);
    });
  }
}

module.exports = BlockchainModule;
