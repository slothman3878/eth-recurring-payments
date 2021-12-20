const { expect } = require('chai');
const { waffle } = require('hardhat');
const provider = waffle.provider;

const delta = 1e3;

const bigNum2Int=(bn)=>{
  return parseInt(bn.toString())
}

describe("Contract Subscription", async () => {
  let deployer, subscriber, beneficiary_deployer;

  var simp_address;
  var subscriber_address;
  var subscriberBasic;

  var SubscriberFactory;
  var SubBeneficiaryFactory;
  var SimpToken;
  var SubscriberBasic;
  var SubBeneficiary;

  beforeEach(async() => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    subscriber = signers[1];
    beneficiary_deployer = signers[3];

    simp_address = require("../deployments/localhost/SimpleToken.json").address;
    subscriber_address = require("../deployments/localhost/SubscriberBasic.json").address;

    SubscriberFactory = await ethers.getContractFactory('SubscriberBasic');
    SubBeneficiaryFactory = await (await ethers.getContractFactory('SubBeneficiary')).connect(beneficiary_deployer);
  
    SimpToken = await SimpTokenFactory.attach(simp_address);
    SubscriberBasic = await (await SubscriberFactory.attach(subscriber_address)).connect(subscriber);

    SubBeneficiary = await SubBeneficiaryFactory.deploy(
      ethers.constants.AddressZero
    );
    await SubBeneficiary.deployed();
  });

  it("Subscription and collection in Ether", async () => {
    expect(await provider.getBalance(subscriber_address)).to.be.above(1);
    /// subscribe
    await SubscriberBasic.subscribe(
      SubBeneficiary.address,
      1,
      20, /// 20 seconds
      0,  /// can collect now
      ethers.constants.AddressZero,   /// ether
      []
    );
    /// console.log(SubscriberBasic.filters.Subscription(SubBeneficiary.address));
    expect(await SubscriberBasic.isSubscribedTo(SubBeneficiary.address));
    
    /// initial collection
    await SubBeneficiary.collectFrom(
      SubscriberBasic.address,
      1,
      ethers.constants.AddressZero
    );

    /// collect after 20 seconds
    await new Promise((resolve)=>{setTimeout(resolve, 20000);});

    await SubBeneficiary.collectFrom(
      SubscriberBasic.address,
      1,
      ethers.constants.AddressZero
    );

    /// unsubscribe from beneficiary
    SubscriberBasic = SubscriberBasic.connect(subscriber);
    await SubscriberBasic.unsubscribe(SubBeneficiary.address);
  });

  it("Subscription and collection in wallet token", async () => {
    expect(await provider.getBalance(subscriber_address)).to.be.above(1);
    /// subscribe
    await SubscriberBasic.subscribe(
      SubBeneficiary.address,
      1,
      20, /// 20 seconds
      0,  /// can collect now
      simp_address,
      []
    );
    /// console.log(SubscriberBasic.filters.Subscription(SubBeneficiary.address));
    expect(await SubscriberBasic.isSubscribedTo(SubBeneficiary.address));
    
    /// initial collection
    var prev_balance = await SimpToken.balanceOf(SubBeneficiary.address);

    await SubBeneficiary.collectFrom(
      SubscriberBasic.address,
      1,
      simp_address
    );

    expect(bigNum2Int(prev_balance)+1).to.equal(await SimpToken.balanceOf(SubBeneficiary.address));

    /// collect after 20 seconds
    await new Promise((resolve)=>{setTimeout(resolve, 20000);});

    await SubBeneficiary.collectFrom(
      SubscriberBasic.address,
      1,
      simp_address
    );

    /// unsubscribe from beneficiary
    SubscriberBasic = SubscriberBasic.connect(subscriber);
    await SubscriberBasic.unsubscribe(SubBeneficiary.address);
  });
});