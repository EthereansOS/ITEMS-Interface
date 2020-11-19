# Contract IERC1155WrapperV1

* **Path:** IERC1155WrapperV1.sol
* **Version:** 1
* **Title:** ERC1155 NFT-Based EthItem, version 1

---

- [Description](#description)
- [Methods](#methods)
  - [init(address, string calldata, string calldata, bool, bool, bool)](#initaddress-string-calldata-string-calldata-bool-bool-bool)
    - [Params](#params)
  - [source()](#source)

## Description

ERC1155 NFT-Based EthItem, version 1.

## Methods

### init(address, string calldata, string calldata, bool, bool, bool)

Contract Initialization.

#### Params

- `name`: The chosen name for this NFT
- `symbol`: The chosen symbol (Ticker) for this NFT
- `source`: The address of the Original ERC1155 NFT Wrapped in this collection
- `supportsSpecificName`: Set to true if the given source NFT supports the `name(uint256)` function.
- `supportsSpecificSymbol`: Set to true if the given source NFT supports the `symbol(uint256)` function.
- `supportsSpecificDecimals`: Set to true if the given source NFT supports the `decimals(uint256)` function.

### source()

GET The address of the original wrapped ERC1155 NFT.
