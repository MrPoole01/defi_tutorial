const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback) {
    // Script that runs
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()

    // Code here...
    console.log("Mo Money! Mo Money!");

    callback()
  }