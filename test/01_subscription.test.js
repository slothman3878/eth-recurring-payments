const { expect } = require('chai');
const sinon = require('sinon');
const { waffle } = require('hardhat');
const provider = waffle.provider;

const delta = 1e3;

const bigNum2Int=(bn)=>{
  return parseInt(bn.toString())
}

describe("Subscription", async () => {
  var clock;

  let deployer, subscriber, external_beneficiary, contract_beneficiary;

  var simp_address;
  var subscriber_address;
  var subscriberBasic;

  var SubscriberFactory;
  var SubBeneficiaryFactory;
  var SimpToken;
  var SubscriberBasic;

  beforeEach(async() => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    subscriber = signers[1];
    external_beneficiary = signers[2];
    contract_beneficiary = signers[3];

    simp_address = require("../deployments/localhost/SimpleToken.json").address;
    subscriber_address = require("../deployments/localhost/SubscriberBasic.json").address;

    SubscriberFactory = await ethers.getContractFactory('SubscriberBasic');
    SubBeneficiaryFactory = await ethers.getContractFactory('SubBeneficiary');
  
    SimpToken = await SimpTokenFactory.attach(simp_address);
    SubscriberBasic = await (await SubscriberFactory.attach(subscriber_address)).connect(subscriber);
  });

  it("Subscription and collection in Ether", async () => {
    expect(await provider.getBalance(subscriber_address)).to.be.above(1);
    /// subscribe
    var receipt = await (await SubscriberBasic.subscribe(
      await external_beneficiary.getAddress(),
      1,
      20, /// 20 seconds
      0,  /// can collect now
      ethers.constants.AddressZero,   /// ether
      []
    )).wait();
    var newEvents = receipt.events?.filter((x)=>{return x.event=='Subscription'});
    var eventArgs = newEvents[newEvents.length-1].args;
    expect(bigNum2Int(eventArgs.next_payment)).is.closeTo(
      new Date().getTime()/1000, delta
    );
    /// initial collection
    SubscriberBasic = await SubscriberBasic.connect(external_beneficiary);
    receipt = await (await SubscriberBasic.collect(
      external_beneficiary.address,
      1,
      ethers.constants.AddressZero
    )).wait();
    newEvents = receipt.events?.filter((x)=>{return x.event=='Payment'});
    eventArgs = newEvents[newEvents.length-1].args;
    expect(eventArgs.next_payment).to.equal(await SubscriberBasic.nextPayment(
      external_beneficiary.address
    ));

    /// collect after 20 seconds
    await new Promise((resolve)=>{setTimeout(resolve, 20000);});

    receipt = await (await SubscriberBasic.collect(
      external_beneficiary.address,
      1,
      ethers.constants.AddressZero
    )).wait();
    newEvents = receipt.events?.filter((x)=>{return x.event=='Payment'});
    eventArgs = newEvents[newEvents.length-1].args;

    /// unsubscribe from beneficiary
    SubscriberBasic = SubscriberBasic.connect(subscriber);
    await SubscriberBasic.unsubscribe(external_beneficiary.address);
  });

  it("Subscription and collection in wallet token", async()=>{
    expect(await SimpToken.balanceOf(subscriber_address)).to.be.above(1);
    /// subscribe
    expect(await provider.getBalance(subscriber_address)).to.be.above(1);
    var receipt = await (await SubscriberBasic.subscribe(
      external_beneficiary.address,
      1,
      15, /// 15 seconds
      0,  /// can collect now
      simp_address,   /// simple token
      []
    )).wait();
    var newEvents = receipt.events?.filter((x)=>{return x.event=='Subscription'});
    var eventArgs = newEvents[newEvents.length-1].args;
    expect(bigNum2Int(eventArgs.next_payment)).is.closeTo(
      new Date().getTime()/1000, delta
    );
    
    var prev_balance = await SimpToken.balanceOf(external_beneficiary.address);

    SubscriberBasic = await SubscriberBasic.connect(external_beneficiary);
    receipt = await (await SubscriberBasic.collect(
      external_beneficiary.address,
      1,
      simp_address
    )).wait();

    /// collect after 20 seconds
    await new Promise((resolve)=>{setTimeout(resolve, 15000);});

    receipt = await (await SubscriberBasic.collect(
      external_beneficiary.address,
      1,
      simp_address
    )).wait();
    newEvents = receipt.events?.filter((x)=>{return x.event=='Payment'});
    eventArgs = newEvents[newEvents.length-1].args;

    /// unsubscribe from beneficiary
    SubscriberBasic = SubscriberBasic.connect(subscriber);
    await SubscriberBasic.unsubscribe(external_beneficiary.address);
  })
});