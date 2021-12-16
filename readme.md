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

The key word here is **promise**. 

## Solution


A transaction can only be scheduled if the preceding transaction is completed.