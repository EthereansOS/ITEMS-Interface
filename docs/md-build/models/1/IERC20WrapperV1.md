# Contract IERC20WrapperV1

* **Path:** IERC20WrapperV1.sol
* **Version:** 1
* **Title:** ERC20-Based EthItem

---

- [Description](#description)
- [Methods](#methods)
  - [source(uint256)](#sourceuint256)
    - [Params](#params)
  - [object(address)](#objectaddress)
    - [Params](#params-1)
  - [mint(address)](#mintaddress)
    - [Params](#params-2)
    - [Returns](#returns)

## Description

All the wrapped ERC20 Tokens will be created following this Model.

The minting operation can be done by calling the appropriate method given in this interface.

The burning operation will send back the original wrapped ERC20 amount.

To initialize it, the original `init(address, string, string)` function of the EthItem Token Standard will be used, but the first address parameter will be the original ERC20 Source Contract to Wrap, and NOT the ERC20Model, which is always taken by the Contract who creates the Wrapper.

## Methods

### source(uint256)

GET - the wrapped ERC20 Token address corresponding to the given objectId

#### Params

- `objectId`: Get the Object Id you want to know info about.

### object(address)

GET the id in the collection which corresponds to the given erc20TokenAddress.

#### Params

- `erc20TokenAddress`: the wrapped ERC20 Token address you want to know info about

### mint(address)

Mint operation.
It inhibits and bypasses the original EthItem Token Standard `mint(uint256, string)`.
The logic will execute a transferFrom call to the given erc20TokenAddress to transfer the chosen amount of tokens

#### Params

- `erc20TokenAddress`: The token address to wrap.
- `amount`: The token amount to wrap
- `tokenUri`: The uri containing all the Token's metadata, it can be blank if it is not the first time this token has been wrapped

#### Returns

- `objectId`: the id given by this collection to the given erc20TokenAddress. It can be brand new if it is the first time this collection is created. Otherwise, the firstly-created objectId value will be used.
- `wrappedTokenAddress`: The address ethItemERC20Wrapper generated after the creation of the returned objectId
