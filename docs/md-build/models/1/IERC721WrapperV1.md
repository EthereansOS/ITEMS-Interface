# Contract IERC721WrapperV1

* **Path:** IERC721WrapperV1.sol
* **Version:** 1
* **Title:** ERC721 NFT-Based EthItem, version 1

---

- [Description](#description)
- [Methods](#methods)
  - [source()](#source)

## Description

All the wrapped ERC721 NFTs will be created following this Model.

The minting operation can be done only by transferring the original ERC721 Item through the classic safeTransferFrom call.

The burning operation will send back the original wrapped NFT.

To initialize it, the original 'init(address,string,string)'
function of the EthItem Token Standard will be used, but the first address parameter will be the original ERC721 Source Contract to Wrap, and NOT the ERC20Model, which is always taken by the Contract who creates the Wrapper.

As the entire amount of the contract is always 1, the owner of the object can be the

## Methods

### source()

GET the address of the original wrapped ERC721 NFT
