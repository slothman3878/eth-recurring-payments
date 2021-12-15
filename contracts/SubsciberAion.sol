// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/ISubscriber.sol";
import "./interface/ISubBeneficiary.sol";
import "./libraries/TransferHelper.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// interface Aion
abstract contract Aion {
  uint256 public serviceFee;
  function ScheduleCall(
    uint256 blocknumber, 
    address to, 
    uint256 value, 
    uint256 gaslimit, 
    uint256 gasprice, 
    bytes memory data, 
    bool schedType
  ) public payable virtual returns (uint,address);
  
  function cancellScheduledTx(
    uint256 blocknumber, 
    address from, 
    address to, 
    uint256 value, 
    uint256 gaslimit, 
    uint256 gasprice,
    uint256 fee, 
    bytes calldata data, 
    uint256 aionId, 
    bool schedType
  ) external virtual returns(bool);
}

contract SubscriberAion is Ownable, ERC165, ISubscriber{
  using Address for address;

  struct Sub {
    address token;
    uint256 fee;
    uint256 period;
    uint256 next_payment;
  }

  address constant private _aion_main = 0xCBe7AB529A147149b1CF982C3a169f728bC0C3CA;
  address constant private _aion_ropsten = 0xFcFB45679539667f7ed55FA59A15c8Cad73d9a4E;
  Aion private _aion;

  constructor() {
    _aion = Aion(_aion_ropsten);
  }

  // for safety
  receive() external payable {}

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
    bytes memory //_data
  ) public override {
    /// will add assembly script to parse _data into gas_limit and fee
    uint256 gas_limit = 2e4;
    uint256 gas_fee = 1e9;

    _subscriptions[_beneficiary] = Sub({
      token: _token,
      fee: _amount,
      period: _period,
      next_payment: _next_payment
    });
    _is_subscribed[_beneficiary] = true;
    emit Subscription(_beneficiary, _token, _amount, _period, _next_payment);

    schedulePayment(_beneficiary, gas_limit, gas_fee);
  }

  function unsubscribe(
    address _beneficiary
  ) external override {
    _is_subscribed[_beneficiary] = false;
  }

  // unnecessary for this implementation
  function collect(
    address,
    uint256,
    address
  ) public pure override {
    revert();
  }

  function payment(
    address _beneficiary,
    uint256 _amount,
    address _token,
    uint256 _gas_limit,
    uint256 _gas_price
  ) external virtual {
    require(_is_subscribed[_beneficiary], "Subscriber: Not subscribed to beneficiary");
    require(_amount==_subscriptions[_beneficiary].fee, "Subscriber: Attempted Collection is not the agreed fee");
    require(block.timestamp >= _subscriptions[_beneficiary].next_payment, "Subscriber: Attempted collection earlier than scheduled");

    uint256 last_payment = _subscriptions[_beneficiary].next_payment;
    _subscriptions[_beneficiary].next_payment += _subscriptions[_beneficiary].period;

    if(_token == address(0)) {
      (bool success,) = _beneficiary.call{value: _amount}("");
      require(success,"Subscriber: Failed ETH transfer");
    } else {
      TransferHelper.safeTransfer(_token, _beneficiary, _amount);
    }
    emit Payment(_beneficiary, _token, _amount, last_payment);
    // schedule next payment
    schedulePayment(_beneficiary, _gas_limit, _gas_price);
  }

  function schedulePayment(
    address _beneficiary,
    uint256 _gas_limit,
    uint256 _gas_price
  ) public {
    bytes memory data = abi.encodeWithSelector(bytes4(keccak256("payment()")));
    uint callCost = _aion.serviceFee() + _gas_price*_gas_limit;
    _aion.ScheduleCall(
      _subscriptions[_beneficiary].next_payment, 
      address(this), 
      0, 
      callCost, 
      _gas_price, 
      data, 
      true);
  }
}