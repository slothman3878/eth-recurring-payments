// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Subscriber Wallet Standard
/// NOTE: must be implemented with ERC-165 and some ownership condition
interface ISubscriber {
  /// @dev Emits when Subscriber initiates a subscritption to new beneficiary
  /*
   * 
   */
  event Subscription(
    address indexed beneficiary,
    address token,
    uint256 fee,
    uint256 period,
    uint256 next_payment
  );

  /// @dev Emits when a beneficiary collects from subscriber
  /*
   * Timestamp instead of block number for convenience of implementation.
   * But since this should work as an index, it does make more sense to emit blocknumber instead
   * Easier to get timestamp from blocknumber than the other way around.
   */
  event Payment(
    address indexed beneficiary,
    address token,
    uint256 fee,
    uint256 indexed timestamp,
    uint256 next_payment
  );

  /// @notice last collection date by collector
  /// @param _collector Collector's address
  /// @return last collection date
  function nextPayment(
    address _collector
  ) external view returns(uint256);

  function isSubscribedTo(
    address _beneficiary
  ) external view returns(bool);

  /// @notice ether transfer. Adds basic wallet functionality to smart contract.
  /// @param _amount Amount of Ether
  /// @param _to     Recipient
  /// NOTE: should have is_owner modifier
  function transfer(
    uint256 _amount,
    address _to
  ) external;

  /// @notice ERC20 transfer
  /// @param _amount Amount of Tokens
  /// @param _to     Recipient
  /// @param _token  Token contract address
  /// NOTE: should have is_owner modifier
  function transfer(
    uint256 _amount,
    address _to,
    address _token
  ) external;

  /// @notice 
  /// @param _beneficiary   Subscribee contract address
  /// @param _amount        Subscription Fee
  /// @param _period        Payment Schedule in seconds
  /// @param _next_payment  Timestamp of next payment
  /// @param _token         token address. If _token == address(0), the subscription is in ETH
  /// @param _data          misc input
  /// NOTE: should have is_owner modifier
  function subscribe(
    address _beneficiary,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment,
    address _token,
    bytes memory _data
  ) external;

  function unsubscribe(
    address _beneficiary
  ) external;

  /// @notice subscription fee collection (in ERC20 tokens)
  /// @param _beneficiary beneficiary address
  /// @param _amount      amount of ETH
  /// @param _token       ERC20 token address. Should == 0x0 in case of Ether collection
  function collect(
    address _beneficiary,
    uint256 _amount,
    address _token
  ) external;
}