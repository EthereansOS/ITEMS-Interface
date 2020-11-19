# Contract IEthItemFactory

* **Path:** IEthItemFactory.sol
* **Version:** 1
* **Title:** EthItemFactory Interface

---

- [Description](#description)
- [Methods](#methods)
  - [doubleProxy()](#doubleproxy)
  - [setDoubleProxy(address)](#setdoubleproxyaddress)
    - [Params](#params)
  - [ethItemInteroperableInterfaceModel()](#ethiteminteroperableinterfacemodel)
  - [setEthItemInteroperableInterfaceModel(address)](#setethiteminteroperableinterfacemodeladdress)
    - [Params](#params-1)
  - [nativeModel()](#nativemodel)
  - [setNativeModel(address)](#setnativemodeladdress)
    - [Params](#params-2)
  - [erc1155WrapperModel()](#erc1155wrappermodel)
  - [setERC1155WrapperModel(address)](#seterc1155wrappermodeladdress)
    - [Params](#params-3)
  - [erc20WrapperModel()](#erc20wrappermodel)
  - [setERC20WrapperModel(address)](#seterc20wrappermodeladdress)
    - [Params](#params-4)
  - [erc721WrapperModel()](#erc721wrappermodel)
  - [setERC721WrapperModel(address)](#seterc721wrappermodeladdress)
    - [Params](#params-5)
  - [mintFeePercentage()](#mintfeepercentage)
  - [setMintFeePercentage(uint256, uint256)](#setmintfeepercentageuint256-uint256)
    - [Params](#params-6)
  - [calculateMintFee(uint256)](#calculatemintfeeuint256)
    - [Params](#params-7)
  - [burnFeePercentage()](#burnfeepercentage)
  - [setBurnFeePercentage(uint256, uint256)](#setburnfeepercentageuint256-uint256)
    - [Params](#params-8)
  - [calculateBurnFee(uint256)](#calculateburnfeeuint256)
    - [Params](#params-9)
  - [createNative()](#createnative)
    - [Params](#params-10)
    - [Return](#return)
  - [createERC1155(bytes calldata)](#createerc1155bytes-calldata)
    - [Params](#params-11)
  - [createWrappedERC1155(bytes calldata)](#createwrappederc1155bytes-calldata)
    - [Params](#params-12)
    - [Return](#return-1)
  - [createWrappedERC20(bytes calldata)](#createwrappederc20bytes-calldata)
    - [Params](#params-13)
    - [Return](#return-2)
  - [createWrappedERC721(bytes calldata)](#createwrappederc721bytes-calldata)
    - [Params](#params-14)
    - [Return](#return-3)

## Description

This contract represents the Factory Used to deploy all the EthItems, keeping track of them.

## Methods

### doubleProxy()

GET - The DoubleProxy of the DFO linked to this Contract.

### setDoubleProxy(address)

SET - The DoubleProxy of the DFO linked to this Contract. It can be done only by the Factory controller

#### Params

- `newDoubleProxy`: the new DoubleProxy address

### ethItemInteroperableInterfaceModel()

GET - The address of the Smart Contract whose code will serve as a model for all the EthItemERC20Wrappers (please see the eth-item-token-standard for further information).

### setEthItemInteroperableInterfaceModel(address)

SET - The address of the Smart Contract whose code will serve as a model for all the EthItemERC20Wrappers (please see the eth-item-token-standard for further information). It can be done only by the Factory controller.

#### Params

- `ethItemInteroperableInterfaceModelAddress`: the ethItemInteroperableInterfaceModelAddress to set

### nativeModel()

GET - The address of the Smart Contract whose code will serve as a model for all the Native EthItems.
Every EthItem will have its own address, but the code will be cloned from this one.

### setNativeModel(address)

SET - The address of the Native EthItem model. It can be done only by the Factory controller.

#### Params

- `nativeModelAddress`: Address to set

### erc1155WrapperModel()

GET - The address of the Smart Contract whose code will serve as a model for all the Wrapped ERC1155 EthItems.
Every EthItem will have its own address, but the code will be cloned from this one.

### setERC1155WrapperModel(address)

SET - The address of the ERC1155 NFT-Based EthItem model. It can be done only by the Factory controller.

#### Params

- `erc1155ModelAddress`: Address of the ERC1155 NFT-Based EthItem model to set


### erc20WrapperModel()

GET - The address of the Smart Contract whose code will serve as a model for all the Wrapped ERC20 EthItems.

### setERC20WrapperModel(address)

SET - The address of the Smart Contract whose code will serve as a model for all the Wrapped ERC20 EthItems.

**Note:** It can be done only by the Factory controller.

#### Params

- `erc20WrapperModelAddress`: Address of the Contract whose code will serve as a model for all the Wrapped ERC20 EthItem

### erc721WrapperModel()

GET - The address of the Smart Contract whose code will serve as a model for all the Wrapped ERC721 EthItems.

### setERC721WrapperModel(address)

SET - The address of the Smart Contract whose code will serve as a model for all the Wrapped ERC721 EthItems.

It can be done only by the Factory controller.

#### Params

- `erc721WrapperModelAddress`: Address to set

### mintFeePercentage()

GET - The elements (numerator and denominator) useful to calculate the percentage fee to be transferred to the DFO for every new Minted EthItem.

### setMintFeePercentage(uint256, uint256)

SET - The element useful to calculate the Percentage fee.
It can be done only by the Factory controller.

#### Params

- `mintFeePercentageNumerator`: Numerator used to compute the Percentage fee.
- `mintFeePercentageDenominator`: Denominator used to compute the Percentage fee.

### calculateMintFee(uint256)

Useful utility method to calculate the percentage fee to transfer to the DFO for the minted EthItem amount.

#### Params

- `erc20WrapperAmount`: The amount of minted EthItem

### burnFeePercentage()

GET - The elements (numerator and denominator) useful to calculate the percentage fee to be transferred to the DFO for every Burned EthItem

### setBurnFeePercentage(uint256, uint256)

SET - The element useful to calculate the Percentage fee.
It can be done only by the Factory controller.

#### Params

- `burnFeePercentageNumerator`: Numerator used to compute the Percentage fee.
- `burnFeePercentageDenominator`: Denominator used to compute the Percentage fee.

### calculateBurnFee(uint256)

Useful utility method to calculate the percentage fee to transfer to the DFO for the minted EthItem amount.

#### Params

- `erc20WrapperAmount`: The amount of minted EthItem

### createNative()

Business Logic to create a brand-new EthItem.
It raises the `NewNativeCreated` events.

#### Params

- `modelInitCallPayload`: The ABI-encoded input parameters to be passed to the model to physically create the NFT. It changes according to the Model Version.

#### Return

- `ethItemAddress`: The address of the new EthItem
- `ethItemInitResponse`: The ABI-encoded output response eventually received by the Model initialization procedure.

### createERC1155(bytes calldata)

Business Logic to create a brand-new EthItem. It raises the `NewERC1155Created` event.

#### Params

- `modelInitCallPayload`: The ABI-encoded input parameters to be passed to the model to physically create the NFT. It changes according to the Model Version.
- `ethItemAddress`: The address of the new EthItem
- `ethItemInitResponse` The ABI-encoded output response eventually received by the Model initialization procedure.

### createWrappedERC1155(bytes calldata)

Business Logic to wrap already existing ERC1155 Tokens to obtain a new NFT-Based EthItem. It raises the `NewWrappedERC1155Created` event.

#### Params

- `modelInitCallPayload`: The ABI-encoded input parameters to be passed to the model to physically create the NFT. It changes according to the Model Version.

#### Return

- `ethItemAddress`: The address of the new EthItem
- `ethItemInitResponse`: The ABI-encoded output response eventually received by the Model initialization procedure.

### createWrappedERC20(bytes calldata)

Business Logic to wrap already existing ERC20 Tokens to obtain a new NFT-Based EthItem. It raises the `NewWrappedERC20Created` event.

#### Params

- `modelInitCallPayload`: The ABI-encoded input parameters to be passed to the model to physically create the NFT. It changes according to the Model Version.

#### Return

- `ethItemAddress`: The address of the new EthItem
- `ethItemInitResponse`: The ABI-encoded output response eventually received by the Model initialization procedure.

### createWrappedERC721(bytes calldata)

Business Logic to wrap already existing ERC721 Tokens to obtain a new NFT-Based EthItem. It raises the 'NewWrappedERC721Created' event.

#### Params

- `modelInitCallPayload` The ABI-encoded input parameters to be passed to the model to physically create the NFT. It changes according to the Model Version.

#### Return

- `ethItemAddress`: The address of the new EthItem
- `ethItemInitResponse`: The ABI-encoded output response eventually received by the Model initialization procedure.
