// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/ISubscriber.sol";
import "./interface/ISubBeneficiary.sol";
import "./libraries/TransferHelper.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SubscriberBasic is Ownable, ERC165, ISubscriber {
  using Address for address;

  // for safety
  receive() external payable {}

  struct Sub {
    address token;
    uint256 fee;
    uint256 period;
    uint256 next_payment;
  }

  /// mapping from potential beneficiaries to subscription state
  mapping(address => bool) private _is_subscribed;
  /// mapping to beneficiaries to subscriptions
  mapping(address => Sub) private _subscriptions;

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC165) returns (bool) {
    return
      interfaceId == type(ISubscriber).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function nextPayment(
    address _beneficiary
  ) public view override returns(uint256) {
    require(_is_subscribed[_beneficiary], "Subscriber: not subscribed to beneficiary");
    return _subscriptions[_beneficiary].next_payment;
  }

  function isSubscribedTo(
    address _beneficiary
  ) public view override returns(bool) {
    /// there are definitely better possible implementations for this
    return _is_subscribed[_beneficiary];
  }

  function transfer(
    uint256 _amount,
    address _to
  ) public onlyOwner override {
    (bool success,) = _to.call{value: _amount, gas: 5000}("");
    require(success,"Subscriber: Failed ETH transfer");
  }

  function transfer(
    uint256 _amount,
    address _to,
    address _token
  ) public onlyOwner override {
    TransferHelper.safeTransfer(_token, _to, _amount);
  }

  function subscribe(
    address _beneficiary,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment,
    address _token,
    bytes memory
  ) public onlyOwner override virtual {
    require(!_is_subscribed[_beneficiary], "Subscriber: Already subscribed to specified beneficiary");
    uint256 current_timestamp = block.timestamp;
    if (current_timestamp > _next_payment) {
      _next_payment = current_timestamp;
    }
    _subscriptions[_beneficiary] = Sub({
      token: _token,
      fee: _amount,
      period: _period,
      next_payment: _next_payment
    });
    _is_subscribed[_beneficiary] = true;
    emit Subscription(_beneficiary, _token, _amount, _period, _next_payment);
    require(_checkOnSubscription(
      address(this), _beneficiary, _token, _amount,_period,_next_payment), 
      "Subscriber: Attempted Subscription to non-SubBeneficiary implementer");
  }

  function unsubscribe(
    address _beneficiary
  ) public onlyOwner override virtual {
    _is_subscribed[_beneficiary] = false;
    delete _subscriptions[_beneficiary];
  }

  function collect(
    address _beneficiary,
    uint256 _amount,
    address _token
  ) public override virtual {
    require(msg.sender==_beneficiary, "Subscriber: Collection not by Beneficiary");
    require(_is_subscribed[_beneficiary], "Subscriber: Not subscribed to beneficiary");
    require(_amount==_subscriptions[_beneficiary].fee, "Subscriber: Attempted Collection is not the agreed fee");
    require(_token == _subscriptions[_beneficiary].token, "Subscriber: Specified token is not the one defined during subscription");
    require(block.timestamp >= _subscriptions[_beneficiary].next_payment, "Subscriber: Attempted collection earlier than scheduled");

    _subscriptions[_beneficiary].next_payment = block.timestamp + _subscriptions[_beneficiary].period;
    
    if(_token == address(0)) {
      (bool success,) = _beneficiary.call{value: _amount}("");
      require(success,"Subscriber: Failed ETH transfer");
    } else {
      TransferHelper.safeTransfer(_token, _beneficiary, _amount);
    }
    emit Payment(_beneficiary, _token, _amount, block.timestamp, _subscriptions[_beneficiary].next_payment);

    require(_checkOnCollection(
      address(this), _beneficiary, _token, _amount, block.timestamp),
      "Subscriber: collection attempted by non-SubBeneficiary implementer");
  }

  function _checkOnSubscription(
    address _subscriber,
    address _beneficiary,
    address _token,
    uint256 _amount,
    uint256 _period,
    uint256 _next_payment
  ) private returns (bool) {
    if(_beneficiary.isContract()) {
      try ISubBeneficiary(_beneficiary).onSubscription(
        msg.sender, _subscriber, _token, _amount, _period, _next_payment
      ) returns (bytes4 retval) {
        return retval == ISubBeneficiary.onSubscription.selector;
      } catch (bytes memory reason) {
        if (reason.length == 0) {
          revert("Subscriber: subscription attempted to non-SubBeneficiary implementer");
        } else {
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    } else {
      return true;
    }
  }

  function _checkOnCollection(
    address _subscriber,
    address _beneficiary,
    address _token,
    uint256 _amount,
    uint256 _timestamp
  ) private returns (bool) {
    if(_beneficiary.isContract()) {
      try ISubBeneficiary(_beneficiary).onCollection(
        msg.sender, _subscriber, _token, _amount, _timestamp
      ) returns (bytes4 retval) {
        return retval == bytes4(keccak256(bytes("onCollection(address,address,address,uint256,uint256)")));
      } catch (bytes memory reason) {
        if(reason.length==0) {
          revert("Subscriber: collection attempted by non-SubBeneficiary implementer");
        } else {
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    } else {
      return true;
    }
  }
}