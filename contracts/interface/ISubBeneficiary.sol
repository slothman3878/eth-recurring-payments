// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Subscription Beneficiary Interface
/// NOTE: must be implemented with ERC-165
interface ISubBeneficiary {
  /// @notice called on subscritpion
  /// @return bytes4(keccak256("onSubscription(address,address,address,uint256,uint256,uint256)"))
  function onSubscription(
    address _operator,
    address _subscriber,
    address _token,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment
  ) external returns(bytes4);

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
}