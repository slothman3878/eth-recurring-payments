import {CronJob} from "cron";
import {providers, utils} from "ethers";

const rpcEndPoint = "http://127.0.0.1:8545/";

const job = new CronJob('*/30 * * * * *', () => {

  console.log('Called Every 30 Seconds');

  /// calls on collect function and will check the relevant events
}, null, true, '');

job.start();