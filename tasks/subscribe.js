task("subscribe", "The named account subscriber will subscribe to a given account")
  .addOptionalParam("beneficiary", "The beneficiary account's address", 
    process.env.TEST_PUBLIC_KEY ?? "")
  .addOptionalParam("fee", "Subscription Fee", "1")
  .addOptionalParam("period", "Subscription payment cycle in seconds", "20") // 20 seconds
  .addOptionalParam("nextpayment", "First payment date", "0")
  .addOptionalParam("token", "The address of simple token contract",
    ((path)=>{
      try { return require(path).address; } catch {
        return "";
      }
    })("../deployments/localhost/SimpleToken.json"))
  .setAction(async(args)=>{
    const signers = await ethers.getSigners();
    const subscriberAddress = require("../deployments/localhost/SubscriberBasic.json").address;
    const SubscriberFactory = await ethers.getContractFactory("SubscriberBasic");
    const SubscriberBasic = await (await SubscriberFactory.attach(subscriberAddress))
                              .connect(signers[1]);
     
    const Simp = await ethers.getContractFactory('SimpleToken');
    console.log("----------------------------------------------------");
    await SubscriberBasic.subscribe(
      args.beneficiary,
      ethers.BigNumber.from(args.fee),
      parseInt(args.period),
      parseInt(args.nextpayment),
      args.token,
      []
    );
    console.log(signers[1].address+" has subscribed to "+args.beneficiary);
    console.log("----------------------------------------------------");
  })