const { assert } = require('chai')
const { default: Web3 } = require('web3')

const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
    // Test Code gooes here....
    let daiToken, dappToken, tokenFarm

    before(async () => {
        // Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // Transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    })

    describe('Mock Dai deployment', async () => {
        it('has a name', async () => {
           const name = await daiToken.name()
           assert.equal(name, 'Mock DAI Token')
        })
    })
    
    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
           const name = await dappToken.name()
           assert.equal(name, 'DApp Token')
        })
    })
    
    describe('TokeFarm deployment', async () => {
        it('has a name', async () => {
           const name = await tokenFarm.name()
           assert.equal(name, 'Dapp Token Farm')
        })
        it('contrant has tokens', async () => {
           let balance = await dappToken.balanceOf(tokenFarm.address)
           assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming Tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result

            // Check investoe balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'),  { from: investor })
            await tokenFarm.stakeTokens(tokens('100'),  { from: investor })

            // Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investoro Mock DAI wallet balance correct after staking')

            // Make sure the TokenFarnm received the tokens
            result  = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'TokenFarm Mock DAI balance correct after staking')
            
            // Make sure the staking balance is correct
            result  = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
            
            // Make sure the investor is staking
            result  = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await tokenFarm.issueTokens({ from: owner })

            // Check balance after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp Tooken wallet  balance correct after issuance')

            // Ensure that only oowner can issue  tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected

            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor})

            // CHeck  results after unstaking
            result =  await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance coorrect after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'),  'TokenFarm  Mock DAI  balance coorrect  after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'invester staking  balnce correct after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })
})