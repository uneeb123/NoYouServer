var DatabaseModule = require('./db_module');
var db = new DatabaseModule();

function createUser(username, password, accountId, callback) {
  db.userExists(username, function(exists) {
    if (!exists) {
      db.createUser(username, password, accountId);
      callback({result: 'ok'});
    }
    else {
      callback({errors: 'user_exists'});
    }
  }); 
}

function getAllUsers(callback) {
  db.getAllUsers(function(response) {
    callback(response);
  });
}

function getUser(username, callback) {
  db.userExists(username, function(exists) {
    if (exists) {
      db.getUser(username, function(response) {
        callback(response);
      });
    }
    else {
      callback({error: 'user_not_found'});
    }
  });
}

// createUser('testuser1','testpass1','1');

const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', (request, response) => {
  getAllUsers((result) => {
    response.send(result);
  });
})

app.post('/create', (request, response) => {
  username = request.body.username;
  password = 'testpass';
  accountId = 'testaccount';
  createUser(username, password, accountId, function(result) {
    response.send(result);
  }); 
});

app.get('/user/:username', (request, response) => {
  username = request.params.username;
  getUser(username, function(result) {
    response.send(result);
  });
});

app.post('/send/:to_addr', (request, response) => {
  to_addr = request.params.to_addr;
  from_addr = request.body.from_addr;
});


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
