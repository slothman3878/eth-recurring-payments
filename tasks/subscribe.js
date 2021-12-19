/*
const default_eoa_beneficiary = (await ethers.getSigners())[2];


task("subscribe", "Given subscriber subscribes to given account")
  .addOptionalParam('subscriber', "The subscriber's address",
    require("../deployments/localhost/SubscriberBasic.json").address)
  .addOptionalParam("beneficiary", "The beneficiary's address", default_eoa_beneficiary.address)
  .setAction(async(args) => {
    
  }})

module.exports = {}