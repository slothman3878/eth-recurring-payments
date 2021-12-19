task("fund-simp", "Gives 10k Simp Tokens to Account")
  .addOptionalParam("simpaddress", "The address of simple token contract",
    require("../deployments/localhost/SimpleToken.json").address)
  .addOptionalParam("account", "The account's address",
    require("../deployments/localhost/SubscriberBasic.json").address)
  .addOptionalParam("amount", "Amount of SIMP to be transferred", "10000")
  .setAction(async(args) => {
    const amount = ethers.BigNumber.from(args.amount);
    signers = await ethers.getSigners();
    Simp = await ethers.getContractFactory('SimpleToken');
    console.log("----------------------------------------------------");
    console.log("Make sure you're runing a localhost network and the Simple Token contract has been deployed.");
    console.log("Make sure you've added `--network localhost` at the end of this command");
    console.log("----------------------------------------------------");
    console.log("Transferring " + amount + " Simple Tokens to "+ args.account +" ...")
    simp = await Simp.attach(args.simpaddress);
    await simp.mint(ethers.BigNumber.from(amount));
    await simp.transfer(args.account, amount);
    console.log("Transfer Complete!")
    console.log(args.account+" has "+(await simp.balanceOf(args.account)).toString()+" SIMP")
    console.log("----------------------------------------------------");
  })