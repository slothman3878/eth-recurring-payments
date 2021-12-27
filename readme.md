# Recurring Payments on Ethereum
## Subscriptions in Ethereum

### Features to Implement
1. Trustless timed/scheduled payments using Ether and Transferrable Smart Contract Tokens.
2. Trustless indefinite Recurring Payments.
3. A beneficiary's ability to check upcoming and completed payments.

## Intro
### Motivation
Modern platforms often provide services through "subscriptions": automated, recurring payments from a **Subscriber** to a **Beneficiary**. In a traditional "centralized" banking system, since every account and transaction is maintained by a centralized bank, it is fairly easy to implement such a system. On the other hand, crypto has a lot less flexibility when it comes to transactions. In Ethereum, each individual transaction must be signed by a private key &ndash; a necessary feature, but limiting when it comes to implementing payment streams.

### Solution
The obvious answer seems to be using **Smart Contract Wallets** with subscription functionalities. It's worth thinking in terms of **collections** rather than **payments**. By using smart contract wallets, we can allow beneficiaries to "collect" ether or wallet tokens given time constraints. Such time constraints can be implemented comparing a promised timestamp for collection and `block.timestamp`.

For beneficiaries, scheduled payments can be checked by querying the subscriber contract directly, and completed payments can be queried using event logs.

Here we introduce a simple interface for smart contract that allows **subscription** and **collection** of fees.

### Limitations
1. Limited compatibility with EOAs. While payment beneficiaries can be EOAs, subscribers **MUST** be smart contracts.
2. No clear **Trustless** solution to **Automation**.
  - Potential Solutions to Automation:
    Automation can be implemented either by an off-chain bot that trigggers the `collect` function, or using a decentralized transaction scheduling application like **Aion** or **Chainlink Keepers**.

## Specification
### Contracts
#### `ISubscriber` interface
An interface for a smart contract wallet that supports scheduled collections. Such a contract must have the basic functionalities of a wallet (transfer of ether and wallet tokens) and methods for subscriptiona and collection.

##### Events
```solidity
  /// on subscription
  event Subscription(
    address indexed beneficiary,
    address token,
    uint256 fee,
    uint256 period,
    uint256 indexed next_payment
  )

  /// on Payment or Collection
  event Payment(
    address indexed beneficiary,
    address token,
    uint256 fee,
    uint256 indexed timestamp,
    uint256 indexed next_payment
  )
```

##### Methods
The view functions should disclose subscription related information such as fees, currency, and date of next scheduled payment.

```solidity
  /// view functions
  function nextPayment(address _beneficiary) external view returns(uint256)

  function fee(address _beneficiary) external view returns(uint256)

  function paymentCurrency(address _beneficiary) external view returns(address)

  /// wallet functionality
  function transfer(uint256 _amount, address _to) external
  function transfer(uint256 _amount, address _to, address _token) external

  /// subscription functionality
  /// @notice Subscribes to given beneficiary account
  /// @dev    Contract beneficiaries must implement the ISubBeneficiary interface
  function subscribe(
    address _beneficiary,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment,
    address _token,
    bytes memory _data
  ) external

  /// @notice unsubscribes from given beneficiary
  function unsubscribe(address _beneficiary) external

  /// @notice subscription fee collection
  /// @dev    must be called by beneficiary
  function collect(address _beneficiary, uint256 _amount, address _token) external
```

#### `ISubBeneficiary` interface
For safety, smart contract beneficiary accounts must implement this interface. Functionally similar to the `IERC721Receivable` interface complementing the `IERC721` standard.

```solidity
  /// @notice called on subscritpion
  /// @return bytes4(keccak256("onSubscription(address,address,address,uint256,uint256,uint256)"))
  function onSubscription(
    address _operator,
    address _subscriber,
    address _token,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment
  ) external returns(bytes4)

  /// @notice called on payment collection
  /// @return bytes4(keccak256("onCollection(address,address,address,uint256,uint256"))
  function onCollection(
    address _operator,
    address _subscriber,
    address _token,
    uint256 _amount,
    uint256 _timestamp
  ) external returns(bytes4);

  /// @notice collect payment in Ether from subscriber
  function collectFrom(
    address _subscriber,
    uint256 _amount,
    address _token
  ) external payable;
```

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
Requires a hardhat localhost network running.

Should try using randomly generated wallets/signers instead of those given by the hardhat environment.

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
Simple `Hapi` backend script demonstrating beneficiary-side automation. Complementary react client can be found [here](https://github.com/slothmanxyz/eth-recurring-payments-demo).