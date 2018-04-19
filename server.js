var DatabaseModule = require('./db_module');
var BlockchainModule = require('./blockchain_module');
var randomstring = require("randomstring");

var db = new DatabaseModule();

var blockchain = null;
db.fetchContractAddress((contractAddress) => {
  blockchain = new BlockchainModule(contractAddress);
});

function createUser(username, callback) {
  if (!username) {
    callback({error: 'user_null'});
  }
  else if (username == 'god') {
    db.userExists(username, function(exists) {
      if (!exists) {
        password = randomstring.generate(8); 
        blockchain.getGodAccount((addr) => {
          db.createUser(username, password, addr, function() {
            callback({result: 'ok'});
          });
        });
      }
      else {
        callback({error: 'user_exists'});
      }
    }); 
  }
  else {
    db.userExists(username, function(exists) {
      if (!exists) {
        password = randomstring.generate(8); 
        blockchain.createAccount(password, (addr) => {
          db.createUser(username, password, addr, function() {
            callback({result: 'ok'});
          });
        });
      }
      else {
        callback({error: 'user_exists'});
      }
    }); 
  }
}

function getAllUsers(callback) {
  db.getAllUsers(function(response) {
    var result = [];
    var itemsProcessed = 0;
    if (response === undefined || response.length == 0) {
      callback(result);
    }
    response.forEach((user, index, array) => {
      addr = user.accountId;
      blockchain.getBalance(addr, (balance) => {
        user.balance = balance;
        result.push(user);
        itemsProcessed++;
        if(itemsProcessed === array.length) {
          callback(result);
        }
      });
    });
  });
}

function getUser(username, callback) {
  db.userExists(username, function(exists) {
    if (exists) {
      db.getUser(username, function(response) {
        addr = response.accountId;
        blockchain.getBalance(addr, (balance) => {
          response.balance = balance;
          callback(response);
        });
      });
    }
    else {
      callback({error: 'user_not_found'});
    }
  });
}

function contractExists(callback) {
  db.contractExists((exists) => {
    callback(exists);
  })
}

function sendTokens(from_user, to_user, callback) {
  getUser(from_user, (result) => {
    from_addr = result.accountId;
    from_pass = result.password;
    getUser(to_user, (result2) => {
      to_addr = result2.accountId;
      if (!from_addr || !to_addr) {
        callback(1, null);
      }
      else {
        blockchain.send(from_addr, from_pass, to_addr, function(error) {
          getUser(from_user, function(new_result) {
            callback(error, new_result);
          });
        });
      }
    });
  });
}

const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', (request, response) => {
  try {
    getAllUsers((result) => {
      response.send(result);
    });
  } catch(error) {
    response.send({error: 'unknown'});
  }
})

app.post('/create', (request, response) => {
  username = request.body.username;
  try {
  createUser(username, function(result) {
    response.send(result);
  }); 
  } catch(error) {
    response.send({error: 'unknown'});
  }
});

app.get('/user/:username', (request, response) => {
  username = request.params.username;
  try {
    getUser(username, function(result) {
      response.send(result);
    });
  } catch(error) {
    response.send({error: 'unknown'});
  }
});

app.post('/send/:to_user', (request, response) => {
  to_user = request.params.to_user;
  from_user = request.body.from_user;
  console.log(request.body);
  try {
    sendTokens(from_user, to_user, function(error, result) {
      if (error) {
        response.send({error: 'unsuccessful'});
      } else {
        response.send(result);
      }
    });
  } catch (error) {
    response.send({error: 'unknown'});
  }
});


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  contractExists((exists) => {
    if (!exists) {
      return console.log('deploy contract first');
    }
  });

  console.log(`server is listening on ${port}`)
})
