import 'dotenv/config';
import {CronJob} from "cron";
import {providers, utils} from "ethers";

const rpcEndPoint = "http://127.0.0.1:8545/";
const private_key: String = process.env.TEST_PRIVATE_KEY ?? "";

const test = async ()=>{
  var conditions = true;
  while(conditions) {

  }
}

const job = new CronJob('* * * * * *', () => {
  console.log('Called Every 30 Seconds');
}, null, true, '');

job.start();