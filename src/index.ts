import 'dotenv/config';
//import {CronJob} from "cron";
import {providers, utils, constants, Contract, Signer} from "ethers";
import Hapi from "@hapi/hapi";

/// json
import * as SimpleTokenJson from "../deployments/localhost/SimpleToken.json";
import * as SubBeneficiaryJson from "../deployments/localhost/SubBeneficiary.json";
import * as SubscriberBasicABI from "../artifacts/contracts/SubscriberBasic.sol/SubscriberBasic.json";

interface AccountPayload {
  account: string;
}

interface SubscribePayload {
  account: string;
  amount: number;
}

const RPC_ENDPOINT = "http://127.0.0.1:8545/";

const PAYMENT_CYCLE = 1; // in seconds

let SimpleToken: Contract;
let SubBeneficiary: Contract;

let external_beneficiary: Signer;
let contract_beneficiary: Signer;
let bank: Signer;

const setup = async () => {
  const provider = new providers.JsonRpcProvider(RPC_ENDPOINT);
  const accounts = await provider.listAccounts();
  external_beneficiary = await provider.getSigner(2);
  contract_beneficiary = await provider.getSigner(3);
  bank = await provider.getSigner(9);

  SimpleToken = new Contract(SimpleTokenJson.address, SimpleTokenJson.abi, bank);
  SubBeneficiary = new Contract(SubBeneficiaryJson.address, SubBeneficiaryJson.abi, contract_beneficiary);
}

const init = async () => {
  let subscribers: string[] = [];

  await setup();

  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      }
    }
  });

  server.route({
    method: '*',
    path: '/{any*}',
    handler: function (request, h) {
      return '404 Error! Page Not Found!';
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      subscribers.push('hello');
      return 'Hello World!';
    }
  });

  server.route({
    method: 'GET',
    path: '/simp',
    handler: (request, h) => {
      return SimpleTokenJson;
    }
  })

  server.route({
    method: 'GET',
    path: '/beneficiary',
    handler: (request, h) => {
      return SubBeneficiaryJson;
    }
  })

  server.route({
    method: 'GET',
    path: '/subscriber',
    handler: (request, h) => {
      return SubscriberBasicABI;
    }
  })

  server.route({
    method: ['PUT', 'POST'],
    path: '/subscribe',
    handler: (request, h) => {
      const payload = request.payload as AccountPayload; //SubscribePayload
      subscribers.push(payload.account);
      console.log(payload.account);
      return {
        desc: 'ether subscription',
        amount: constants.WeiPerEther.div(10)
      };
    }
  })

  server.route({
    method: ['PUT', 'POST'],
    path: '/faucet/eth',
    handler: async (request, h) => {
      const account = (request.payload as AccountPayload).account;
      const tx = await bank.sendTransaction({
        to: account,
        value: constants.WeiPerEther.mul(100),
      });
      return {
        desc: 'ether transfer',
        amount: constants.WeiPerEther.mul(100),
        recipient: account
      };
    }
  })

  await server.start();
  console.log('Server running on %s', server.info.uri);

  return subscribers;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

const test = async (subscribers: string[])=>{
  /// automation
  var conditions = true;
  while(conditions) {
    /// for convenience, this part runs every second
    await new Promise((resolve)=>{setTimeout(resolve, 1000);});
    /// maybe copy subscribers list, and then run a queue
    /// console.log(Date.now());
    /// loop through all subscribers
    subscribers.forEach(async (subscriber: string) => {
      let Subscriber: Contract;
      try { 
        Subscriber = new Contract(subscriber, SubscriberBasicABI.abi, external_beneficiary);
        if(await Subscriber.isSubscribedTo(SubBeneficiary.address)) {
          let fee = await Subscriber.fee(SubBeneficiary.address);
          console.log(fee);
          let currency = await Subscriber.paymentCurrency(SubBeneficiary.address);
          console.log(currency);
          let next_payment = await Subscriber.nextPayment(SubBeneficiary.address);
          console.log(next_payment);
          if(next_payment.toNumber()*1000 < Date.now()) {
            console.log(next_payment.toNumber()*1000 + ' ' + Date.now());
            /// collect
            await SubBeneficiary.collectFrom(
              subscriber,
              fee,
              currency
            );
          }
        }
      } catch(err) {
        console.log(err.message);
      }
    })
  }
}

init().then(subscribers=>
  test(subscribers)
);