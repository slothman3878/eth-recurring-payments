require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('hardhat-deploy');
require('hardhat-contract-sizer');
require('hardhat-gas-reporter');

require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
require('./tasks/accounts');
require('./tasks/fund-eth');
require('./tasks/fund-simp');
require('./tasks/subscribe');
require('./tasks/payments');

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: { // id: 31337
      /*forking: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/'+process.env.ALCHEMY_KEY,
        blocknumber: 13889580
      }*/
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0
    },
    subscriber: {
      default: 1,
      1: 1
    },
    external_beneficiary: {
      default: 2,
      1: 2
    },
    contract_beneficiary: {
      default: 3,
      1: 3
    },
    bank: {
      default : 9,
      1: 9
    }
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 30,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  mocha: {
    timeout: 100000
  }
};
