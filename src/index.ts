import 'dotenv/config';
//import {CronJob} from "cron";
import {providers, utils, Contract, Signer} from "ethers";
import Hapi from "@hapi/hapi";

/// json
import * as SimpleTokenJson from "../deployments/localhost/SimpleToken.json";
import * as SubBeneficiaryJson from "../deployments/localhost/SubBeneficiary.json";
import * as SubscriberBasicABI from "../artifacts/contracts/SubscriberBasic.sol/SubscriberBasic.json";

const RPC_ENDPOINT = "http://127.0.0.1:8545/";

const PAYMENT_CYCLE = 1; // in seconds

let SimpleToken: Contract;

let external_beneficiary: Signer;
let contract_beneficiary: Signer;
let bank: Signer;

const setup = async () => {
  const provider = new providers.JsonRpcProvider(RPC_ENDPOINT);
  const accounts = await provider.listAccounts();
  external_beneficiary = await provider.getSigner(2);
  contract_beneficiary = await provider.getSigner(3);
  bank = await provider.getSigner(9);
  /// console.log(await provider.listAccounts());

  SimpleToken = new Contract(SimpleTokenJson.address, SimpleTokenJson.abi, bank);
}

const init = async () => {
  let subscribers: string[] = [];

  await setup();

  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
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
    method: '*',
    path: '/{any*}',
    handler: function (request, h) {
      return '404 Error! Page Not Found!';
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
    method: ['PUT', 'POST'],
    path: '/subscriber',
    handler: (request, h) => {
      const payload = request.payload;
      /// payload contains subscriber address
      /// how do I trigger the automation tho?
      /// push into a list of subscribers?
      /// what then?
      /// need to trigger transactions at the correct time
      /// what about multiple transactions?
      /// whenever a user loads a page, their subscriber info should provide contract info
      subscribers.push(payload.toString());
      return `Welcome!`;
    }
  })

  server.route({
    method: ['PUT', 'POST'],
    path: '/faucet/eth',
    handler: (request, h) => {
      const payload = request.payload;
      console.log(payload);
      /// payload can be a simple string. In that case, just send the account as a string
      return {
        desc: 'ether transfer',
        amount: 100,
        recipient: payload
      };
    }
  })

  /// can just call the mint function on simple token client-side
  server.route({
    method: ['PUT', 'POST'],
    path: '/faucet/simp',
    handler: (request, h) => {
      const payload = request.payload;
      /// payload can be a simple string. In that case, just send the account as a string
      return {
        desc: 'simp transfer',
        amount: 100,
        recipient: payload
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
    console.log(Date.now());
    /// loop through all subscribers
    subscribers.forEach(async (subscriber: string) => {
      let Subscriber: Contract;
      try { 
        Subscriber = new Contract(subscriber, SubscriberBasicABI.abi, external_beneficiary);
        if(await Subscriber.isSubscribedTo(external_beneficiary)) {
          let fee = await Subscriber.fee(external_beneficiary);
          let currency = await Subscriber.currency(external_beneficiary);
          let next_payment = await Subscriber.nextPayment(external_beneficiary);
          if(next_payment*1000 < Date.now()) {
            /// collect
            await Subscriber.collect(
              await external_beneficiary.getAddress(),
              fee,
              currency
            );
            /// something to do on success?
            /// or perhaps its more "trustless" to check success of payment client-side by querying event logs
            /// haven't I determined that querying event-logs client-side is either dangerous or ineffecient...?
            /// just assume that the client is using a public endpoint
          }
        } /// else if contract_beneficiary
      } catch(err) {
        console.log(err.message);
      }
    })
  }
}

init().then(subscribers=>
  test(subscribers)
);

/*
const job = new CronJob('* * * * * *', () => {
  console.log('Called Every 30 Seconds');
}, null, true, '');

job.start();
*/

// test();