var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:7545');

var oneEth = '1000000000000000000' // wei

web3.eth.getAccounts().then((response) => {
  console.log(response); 
});

var a = web3.eth.accounts.create();
console.log(a);

var newAccount = '0x740333759c7535F398BBc183113ee94d3a3D4Aa1';
var newPrivKey = '0x5658d1ea32a30595e351114c0e6bec1b3fa77310b925df55c75551ac2c2addf1'
var password = 'testpass';

var oldAccount = '0xb32654907226040a39C124005dEfA48977f5a3B7';

web3.eth.personal.importRawKey(newPrivKey, password);

web3.eth.personal.unlockAccount(newAccount, password, 1000).then(
  (response) => {
		console.log(response);
	}
).catch((error) => {
		console.log(error);
});


/*
web3.eth.personal.newAccount('!@superpassword').then((account) => {
  web3.eth.accounts.wallet.add(account);
  console.log(account);
});
*/

function getBalance(add) {
  web3.eth.getBalance(add).then(console.log);
}

function sendTx(add1, add2) {
  console.log("Prev Balance");
  getBalance(add1);
  getBalance(add2);
  web3.eth.sendTransaction({
    from: add1, 
    to: add2,
    value: oneEth
  }).then(function(receipt){
    console.log(receipt);
    console.log("After Balance");
    getBalance(add1);
    getBalance(add2);
    return;
  });
}

sendTx(oldAccount, newAccount);
sendTx(newAccount, oldAccount);



