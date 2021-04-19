pragma solidity >=0.4.21 <0.8.3;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    // All code goes here....
    string public name = 'Dapp Token Farm';
    address public owner;
    DaiToken public daiToken;
    DappToken public dappToken;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner =  msg.sender;
    }

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    // Stake Token (Deposit)
    function stakeTokens(uint _amount) public {
        // Require amouont greater than 0
        require(_amount > 0, 'amount cannot be 0');

        //  Tranfer Mock Dai tokens to this contrat for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender]  = stakingBalance[msg.sender] + _amount;

        // Add users to stakers array *only* if they haven't staked alreay
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update Staking Status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstake Token (Withdraw)
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance  =  stakingBalance[msg.sender];

        // Require amouont greater than 0
        require(balance > 0, 'amount cannot be 0');

        // Transfer Mock Dai token too this contract for staking
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;
        
        // Update staking ststus
        isStaking[msg.sender] = false;
    }


    // Issue Token (Earned Tokens)
    function issueTokens() public {
        // Only owner can call this function
        require(msg.sender  ==  owner, 'caller must be the owner');
        
        // Issue tokens to all stakers
        for (uint i=0;  i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
