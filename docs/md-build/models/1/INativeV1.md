# Contract INativeV1

* **Path:** INativeV1.sol
* **Version:** 1
* **Title:** INativeV1 Interface

---

- [Description](#description)
- [Methods](#methods)
  - [init(string calldata, string calldata, bool, string calldata, address, bytes calldata)](#initstring-calldata-string-calldata-bool-string-calldata-address-bytes-calldata)
    - [Params](#params)
  - [extension()](#extension)
  - [canMint(address)](#canmintaddress)
    - [Params](#params-1)
    - [Returns](#returns)
  - [isEditable(uint256)](#iseditableuint256)
    - [Params](#params-2)
    - [Returns](#returns-1)
  - [releaseExtension()](#releaseextension)
  - [uri()](#uri)
  - [decimals()](#decimals)
  - [mint(uint256, string calldata, string calldata, string calldata, bool)](#mintuint256-string-calldata-string-calldata-string-calldata-bool)
  - [mint(uint256, string calldata, string calldata, string calldata)](#mintuint256-string-calldata-string-calldata-string-calldata)
  - [mint(uint256, uint256)](#mintuint256-uint256)
  - [makeReadOnly(uint256)](#makereadonlyuint256)
  - [setUri(string calldata)](#seturistring-calldata)
  - [setUri(uint256, string calldata)](#seturiuint256-string-calldata)

## Description

This is a pure extension of the EthItem Token Standard, which also introduces an optional extension that can introduce some external behavior to the EthItem.
Extension can also be a simple wallet.

## Methods

### init(string calldata, string calldata, bool, string calldata, address, bytes calldata)

Contract Initialization.

#### Params

- `name`: The chosen name for this NFT.
- `symbol`: The Chosen symbol (ticker) for this NFT.
- `extensionAddress`: The optional address of the extension. It can be a Wallet or a SmartContract
- `extensionInitPayload`: The optional payload useful to call the extension within the new created EthItem

### extension()

GET - The `extensionAddress` of the eventual eventual EthItem main owner or the SmartContract which contains all the logics to directly exploit all the Collection Items of this EthItem. It can also be a simple wallet.

### canMint(address)

Retrieve information on whether a given address can mint new items or not.

#### Params

- `operator`: The address to know info about

#### Returns

- `result`: True if the given address is able to mint new tokens, false otherwise.

### isEditable(uint256)

Retrieve information on whether a Item of the given objectId can be minted.

#### Params

- `objectId`: The item to know info about

#### Returns

- `result`: True if it is possible to mint more items of the given objectId, false otherwise.

### releaseExtension()

Method callable by the extension only and useful to release the control on the EthItem, which from now on will run independently.

### uri()

### decimals()

GET - Number of supported decimals

### mint(uint256, string calldata, string calldata, string calldata, bool)

### mint(uint256, string calldata, string calldata, string calldata)

### mint(uint256, uint256)

### makeReadOnly(uint256)

Make an objectId read-only.

**CAUTION:** This is an irreversible operation.

### setUri(string calldata)

### setUri(uint256, string calldata)
