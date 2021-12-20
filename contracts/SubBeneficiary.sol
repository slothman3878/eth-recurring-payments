// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/ISubscriber.sol";
import "./interface/ISubBeneficiary.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

/// @title Simple Credit-based Subscription beneficiary
/* 
 * @notice When a subscriber contract "subscribes" to this contract, 
 * the subscriber is given a token as proof of subscription.
 * These tokens stack on each successful payment. The tokens effectively work as proof of successful payments.
 */
/// NOTE: must be implemented with ERC-165
contract SubBeneficiary is ISubBeneficiary {
  using Address for address;

  /// subscription fee token
  address private _token;
  /// proof of subscription tokens
  mapping(address => uint32) private _sub_tokens;

  constructor(address token_) {
    _token = token_;
  }

  // for safety
  receive() external payable {}

  function onSubscription(
    address _operator,
    address _subscriber,
    address _token,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment
  ) external override returns(bytes4) {
    _sub_tokens[_subscriber] = 1;
    return ISubBeneficiary.onSubscription.selector;
    //return bytes4(keccak256(bytes("onSubcription(address,address,address,uint256,uint256,uint256)")));
  }

  /// @notice called on payment collection
  function onCollection(
    address _operator,
    address _subscriber,
    address _token,
    uint256 _amount,
    uint256 _timestamp
  ) external override returns(bytes4) {
    return ISubBeneficiary.onCollection.selector;
    //return bytes4(keccak256(bytes("onCollection(address,address,address,uint256,uint256")));
  }

  /// @notice collect payment from subscriber
  /// @dev should call the collect function on given subscriber
  function collectFrom(
    address _subscriber,
    uint256 _amount,
    address _token
  ) external override payable {
    require(_sub_tokens[_subscriber] > 0, "SubBeneficiary: Attempted collection from non-subscriber");
    require(_subscriber.isContract(), "SubBeneficiary: Specified subscriber is not a contract");
    require(ERC165Checker.supportsInterface(
        _subscriber,
        type(ISubscriber).interfaceId
      ), "SubBeneficiary: Specified subscriber does not implement ISubscription");

    _sub_tokens[_subscriber]+=1;

    ISubscriber(_subscriber).collect(
      address(this),
      _amount,
      _token
    );
  }
}