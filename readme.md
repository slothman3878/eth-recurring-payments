# Recurring Payments on Ethereum
## Subscriptions in Ethereum

## Intro
### Motivation
Modern platforms often provide services through "subscriptions": automated, recurring payments from a **Subscriber** to a **Beneficiary**. In a traditional "centralized" banking system, since every account and transaction is maintained by a centralized bank, it is fairly easy to implement such a system. On the other hand, crypto has a lot less flexibility when it comes to transactions. In Ethereum, each individual transaction must be signed by a private key; hence the difficulty of implementing a payment stream.

### Features to Implement
1. Payments using Ether and Transferrable Smart Contract Tokens.
2. Indefinite Recurring Payments.
3. A beneficiary's ability to check upcoming and completed payments.

All three implementations must be **Trustless**.

### Thought Proccess
It's worth thinking in terms of **collections** rather than **payments**. Let's consider what a subscription is:

> A **promise** by a subscriber to pay X to a beneficiary at regular intervals.

<hr>

> A transaction can only be scheduled if the preceding transaction is completed.

## Solution
A smart contract wallet that allows subscriptions.

## Specification
### Contracts
The aim is to maximize interoperability.

#### `ISubscriber` interface


## Test Results

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
Collection automation script written in node.js.
To be implemented.