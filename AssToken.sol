pragma solidity ^0.4.20;

contract AssToken {

  struct Player {
    uint balance;
    bool kicked;
  }

  address owner;
  mapping (address => Player) players;
  uint initialSupply;

  constructor(uint _initialSupply) public {
    owner = msg.sender;
    Player storage player = players[owner];
    player.balance = _initialSupply;
    player.kicked = true;
    initialSupply = _initialSupply;
  }

  function getBalance() public view returns (uint) {
    return players[msg.sender].balance;
  }

  function bless(address _to) public {
    require(_to != msg.sender);
    Player storage sender = players[msg.sender];
    Player storage receiver = players[_to];
    if (sender.kicked != true) return;
    uint amountToTransfer = sender.balance/2;
    if (amountToTransfer <= 1) {
      sender.balance = 1;
    } else {
      sender.balance -= amountToTransfer;
    }

    if (receiver.kicked == true) {
      receiver.balance += amountToTransfer;
    }
    else {
      receiver.balance = initialSupply;
      receiver.kicked = true;
    }
  }
}
