# Recurring Payments on Ethereum
For convenience, only considering pre-paid subscriptions

### Features to Include
1. Trustless time series of payments using both Ether or wallet tokens
2. Trustless indefinite recurring payments on set schedules (i.e. x period of time versus the more practical "12th of December, January, February, etc.)
3. Recipient Notification of recurring payments - i.e. trustless insurance of payment scheduling (credit system)

<hr>

1 is a bit tricky. Every ethereum transaction requires a private key signature. This means that any automated payment system on Ethereum requires trusting a third-party with one's private key &ndash; not "trustless" at all. I've been trying to figure out a solution that allows EOA, but can't think of one as of yet. Potential layer 2 solution may be able to solve this &ndash; a parachain that supports unbounded transaction lists.

2 is easy enough to implement programmatically&ndash;either by specifying a block number and/or timestamp range.

3 is a bit trickier than I thought. A number of things to consider.
- I feel like subscribers wouldn't care about past payments as much as the beneficiaries. In that case, information about completed payments should be handled by the beneficiaries. This makes more sense when you consider the variety of subscription services; spotify vs audible vs post-paid cell phone plans.
  <br>
  In other words, the subscriber should only be concerned with completing the "next payment". This also allows simplifying the subscription wallet design.

### Issues to Consider
* Ideally, the payment recipient should only be concerned with successful transactions and pending transactions.
* Any Ethereum Transaction requires a digital signature of the transferring ether and/or smart contract function call.
  * This system, while inconvenient for recurring payments, is a necessary part of Ethereum's security.

## Method 1 (ERC/Smart Contracts Only)

Subscriptions Wallets &ndash; a.k.a smart contract wallets that allow subscription. For security, recipient accounts are also implemented using smart contracts. Assets move from subscription wallets contracts to recipient wallet contracts. Automation can be supported by using

### Downsides
- Does not support EOA
- Moving assets into these subscription wallets is perhaps an unnecessary extra step. Regular transfer of tokens (unrelated to subscriptions) can be supported, but will result in slightly higher gas fees.

### Programmatic Implementation

* Prerequisites: ERC165
* Wallet Contract, and then Subscriber Wallet Contract

### References
- [makerdao: what are smart contract wallets](https://blog.makerdao.com/what-are-smart-contract-wallets-and-how-can-they-benefit-defi-users/)