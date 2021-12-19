const chai = require('chai');
const { expect } = require('chai');
const { waffle } = require('hardhat');

describe("preliminary", async () => {
  let deployer, subscriber, external_beneficiary;

  let simp_address;
  let subscriber_address;
  let SimpToken;
  let subscriberBasic;

  beforeEach(async() => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    subscriber = signers[1];
    external_beneficiary = signers[2];

    /// check deployment status of contracts
    simp_address = require("../deployments/localhost/SimpleToken.json").address;
    subscriber_address = require("../deployments/localhost/SubscriberBasic.json").address;

    SimpTokenFactory = await ethers.getContractFactory('SimpleToken');
    SubscriberFactory = await ethers.getContractFactory('SubscriberBasic');
  
    SimpToken = await SimpTokenFactory.attach(simp_address);
    SubscriberBasic = await SubscriberFactory.attach(subscriber_address);
  });

  /// subscriber contract is owned by the subscriber eoa
  it("Subscriber Ownership", async () => {
    const subscriber_owner = await SubscriberBasic.owner();
    expect(subscriber_owner).to.equal(subscriber.address);
  });
});