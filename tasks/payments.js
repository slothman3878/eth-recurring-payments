task('payments', 'Returns event-logs for payment events')
  .addParam('subscriber', "The subscriber account address")
  .addOptionalParam('beneficiary', "The beneficiary address",
    ((path)=>{
      try { return require(path).address; } catch {
        return "";
      }
    })("../deployments/localhost/SubBeneficiary.json"))
  .setAction(async(args) => {
    console.log("----------------------------------------------------");
    console.log("Make sure the localhost network is running, and your wallet is connected to a network rpc. Otherwise, the transferred ETH won't be visible.")
    console.log("Make sure you've added `--network localhost` at the end of this command");
    console.log("----------------------------------------------------");
    SubscriberFactory = await ethers.getContractFactory('SubscriberBasic');
    let provider = waffle.provider;
    let abi = ["event Payment(address indexed beneficiary,address token,uint256 fee,uint256 indexed timestamp,uint256 indexed next_payment)"];
    let iface = new ethers.utils.Interface(abi);
    var filter = {
      address: args.subscriber,
    };
    var logs = await provider.getLogs(filter);
    let events = logs.map((log)=>iface.parseLog(log));
    console.log(events);
    console.log("----------------------------------------------------");
  });

module.exports = {};