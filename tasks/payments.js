task('payments', 'Returns event-logs for payment events')
  .addParam('subscriber', "The subscriber account address")
  .addOptionalParam('beneficiary', "The beneficiary address",
    ((path)=>{
      try { return require(path).address; } catch {
        return "";
      }
    })("../deployments/localhost/SubBeneficiary.json"))
  .setAction(async(args) => {
    /*filter = {
      address: tokenAddress,
      topics: [
        id("Payment(address,address,uint256,uint256,uint256)"),
        hexZeroPad(args.beneficiary, 32)
      ]
    };*/
    console.log("----------------------------------------------------");
    console.log("Make sure the localhost network is running, and your wallet is connected to a network rpc. Otherwise, the transferred ETH won't be visible.")
    console.log("Make sure you've added `--network localhost` at the end of this command");
    console.log("----------------------------------------------------");
    SubscriberFactory = await ethers.getContractFactory('SubscriberBasic');
    contract = await SubscriberFactory.attach(args.subscriber);
    console.log(
      contract.filters.Payment(args.beneficiary)
    );
    console.log("----------------------------------------------------");
  });

module.exports = {};