# Contract IEthItemModelBase

* **Path:** IEthItemModelBase.sol
* **Version:** 1
* **Title:** EthItemModelBase Interface

---

- [Description](#description)
- [Methods](#methods)
  - [init(string calldata, string calldata)](#initstring-calldata-string-calldata)
    - [Params](#params)
  - [modelVersion()](#modelversion)
  - [factory()](#factory)

## Description

This interface contains the common data provided by all the EthItem models.

## Methods

### init(string calldata, string calldata)

Contract Initialization, the caller of this method should be a Contract containing the logic to provide the `EthItemERC20WrapperModel` to be used to create ERC20-based objectIds

#### Params

- `name`: The chosen name for this NFT
- `symbol`: The chosen symbol (Ticker) for this NFT

### modelVersion()

GET - The `modelVersionNumber` of the Model, it should be progressive

### factory()

GET - The `factoryAddress` of the Contract which initialized this EthItem
