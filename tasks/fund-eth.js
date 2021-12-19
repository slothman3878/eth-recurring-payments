task('fund-eth', 'Gives localhost 10 ETH to account')
  .addOptionalParam('account', "The account's address",
    require("../deployments/localhost/SubscriberBasic.json").address)
  .addOptionalParam("amount", "The amount of eth", "1000")
  .setAction(async(args) => {
    const amount = ethers.utils.parseEther(args.amount);
    signers = await ethers.getSigners();
    console.log("----------------------------------------------------");
    console.log("Make sure the localhost network is running, and your wallet is connected to a network rpc. Otherwise, the transferred ETH won't be visible.")
    console.log("Make sure you've added `--network localhost` at the end of this command");
    console.log("----------------------------------------------------");
    console.log("Adding " + args.amount + "ETH to "+args.account+" ...");
    const tx = await signers[9].sendTransaction({
      to: args.account,
      value: amount,
    });
    console.log(args.amount + " ETH sent. Check your wallet to verify.")
    console.log("----------------------------------------------------");
  });

module.exports = {};