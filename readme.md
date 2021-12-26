# Recurring Payments on Ethereum
## Subscriptions in Ethereum

### Features to Implement
1. Payments using Ether and Transferrable Smart Contract Tokens.
2. Indefinite Recurring Payments.
3. A beneficiary's ability to check upcoming and completed payments.

All three implementations must be **Trustless**.

## Intro
### Motivation
Modern platforms often provide services through "subscriptions": automated, recurring payments from a **Subscriber** to a **Beneficiary**. In a traditional "centralized" banking system, since every account and transaction is maintained by a centralized bank, it is fairly easy to implement such a system. On the other hand, crypto has a lot less flexibility when it comes to transactions. In Ethereum, each individual transaction must be signed by a private key &ndash; a necessary feature, but limiting when it comes to implementing payment streams.

### Solution
To overcome this limitation, the obvious answer seems to be using **Smart Contract Wallets** instead of **EOA** (externally owned accounts). It's worth thinking in terms of **collections** rather than **payments**. By using smart contract wallets, we can allow beneficiaries to "collect" ether or wallet tokens given conditions &ndash; e.g. timestamp conditions.

Here we introduce a simple interface for smart contract that allows **subscription** and **collection** of fees.

### Limitations of this solution
1. The biggest limitation is obviously lack of compatibility with EOAs. While payment beneficiary's can be EOAs, subscriber's **MUST** be smart contracts.
2. No clear asnswer to **Automation**.
   Arguably, its reasonable to assume that a subscription based payment system should be automated. Automation can be implemented either by an off-chain bot that trigggers the `collect` function, or using a decentralized transaction scheduling application like **Aion** or **Chainlink Keepers**. Both cases are dependent on systems outside of the subscriber-beneficiary relationship.

## Specification
### Contracts
The aim is to maximize interoperability.

#### `ISubscriber` interface


#### `ISubBeneficiary` interface
Smart contract beneficiary accounts must implement this interface. Functionally similar to the `IERC721Receivable` interface for the `IERC721` standard.

### Example Implementations
Example implementations are provided in the `contracts` folder.

#### `SubscriberBasic` is `ISubscriber`
Basic implementation of the `ISubscriber` interface. Uses a mapping from an `address` to a `Subscription` struct to keep track of subscriptions and their metadata.

#### `SubscriberAion` is `ISubscriber`
An implementation of `ISubscriber` that uses the Aion protocol &ndash; a poorly maintained alternative to the old ethereum alarm clock protocol

#### `SubscriberLink` is `ISubscriber`
An implementattion of `ISubscriber` that uses Chainlink's keeper protocol. To be implemented...

#### `SubBeneficiary` is `ISubBeneficiary`
Simple implementation of the `ISubBeneficiary` to demonstrate smart contract subscription beneficiary. Uses a simple credit system as proof of subscription; i.e. whenever a subscriber completes of payment, or whenever the beneficiary completes a collection, the subscriber is given a "token" as proof of completed transaction.

## Hardhat Tests
(needs improvement!!! use randomly generated wallets instead of the given signers)

Right now, running tests is a bit tricky. Requires a hardhat localhost network running, as well as funding the `SimpleToken` (used to test wallet token compatability) for the signers and ether for the contracts.

Tests take just over a minute to run as well. The node runtime can be duped into thinking time has passed, but unsure if the hardhat test network can also be duped as well.

### Contract Sizes
```
  ·-------------------|-------------·
  |  Contract Name    ·  Size (KB)  │
  ····················|··············
  |  Address          ·      0.086  │
  ····················|··············
  |  ERC165Checker    ·      0.086  │
  ····················|··············
  |  ERC20            ·      5.013  │
  ····················|··············
  |  SimpleToken      ·      5.566  │
  ····················|··············
  |  SubBeneficiary   ·      2.942  │
  ····················|··············
  |  SubscriberAion   ·      8.966  │
  ····················|··············
  |  SubscriberBasic  ·     10.585  │
  ····················|··············
  |  TransferHelper   ·      0.086  │
  ·-------------------|-------------·
```


### Gas Calculation
```
  ·-----------------------------------|----------------------------|-------------|----------------------------·
  |        Solc version: 0.8.4        ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
  ····································|····························|·············|·····························
  |  Methods                          ·               30 gwei/gas                ·      3941.34 usd/eth       │
  ····················|···············|··············|·············|·············|··············|··············
  |  Contract         ·  Method       ·  Min         ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
  ····················|···············|··············|·············|·············|··············|··············
  |  SubBeneficiary   ·  collectFrom  ·       66920  ·      94879  ·      76625  ·           4  ·       9.06  │
  ····················|···············|··············|·············|·············|··············|··············
  |  SubscriberBasic  ·  collect      ·       47325  ·      58242  ·      52784  ·           4  ·       6.24  │
  ····················|···············|··············|·············|·············|··············|··············
  |  SubscriberBasic  ·  subscribe    ·      123286  ·     168818  ·     153641  ·           6  ·      18.17  │
  ····················|···············|··············|·············|·············|··············|··············
  |  SubscriberBasic  ·  unsubscribe  ·       37351  ·      39600  ·      38315  ·           7  ·       4.53  │
  ····················|···············|··············|·············|·············|··············|··············
  |  Deployments                      ·                                          ·  % of limit  ·             │
  ····································|··············|·············|·············|··············|··············
  |  SubBeneficiary                   ·           -  ·          -  ·     691626  ·      10.3 %  ·      81.78  │
  ·-----------------------------------|--------------|-------------|-------------|--------------|-------------·
```

### Demo Beneficiary
Simple `Hapi` backend script demonstrating beneficiary-side automation. Mostly for "philosophical" purposes. Strictly speaking, this isn't a "trustless" implementation of automated recurring payments.