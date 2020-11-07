//SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IEthItemFactory.sol";
import "../models/common/IEthItemModelBase.sol";

import "../orchestrator/EthItemOrchestratorDependantElement.sol";
import "eth-item-token-standard/IERC20NFTWrapper.sol";

contract EthItemFactory is IEthItemFactory, EthItemOrchestratorDependantElement {

    uint256[] private _mintFeePercentage;
    uint256[] private _burnFeePercentage;
    address private _ethItemERC20WrapperModelAddress;
    address private _nativeModelAddress;
    address private _erc1155WrapperModelAddress;
    address private _erc721WrapperModelAddress;
    address private _erc20WrapperModelAddress;

    constructor(
        address doubleProxy,
        address ethItemERC20WrapperModelAddress,
        address nativeModelAddress,
        address erc1155WrapperModelAddress,
        address erc721WrapperModelAddress,
        address erc20WrapperModelAddress,
        uint256 mintFeePercentageNumerator, uint256 mintFeePercentageDenominator,
        uint256 burnFeePercentageNumerator, uint256 burnFeePercentageDenominator) public EthItemOrchestratorDependantElement(doubleProxy) {
        _ethItemERC20WrapperModelAddress = ethItemERC20WrapperModelAddress;
        _nativeModelAddress = nativeModelAddress;
        _erc1155WrapperModelAddress = erc1155WrapperModelAddress;
        _erc721WrapperModelAddress = erc721WrapperModelAddress;
        _erc20WrapperModelAddress = erc20WrapperModelAddress;
        _mintFeePercentage = new uint256[](2);
        _mintFeePercentage[0] = mintFeePercentageNumerator;
        _mintFeePercentage[1] = mintFeePercentageDenominator;
        _burnFeePercentage = new uint256[](2);
        _burnFeePercentage[0] = burnFeePercentageNumerator;
        _burnFeePercentage[1] = burnFeePercentageDenominator;
    }

    function _registerSpecificInterfaces() internal virtual override {
        _registerInterface(this.setEthItemERC20WrapperModel.selector);
        _registerInterface(this.setNativeModel.selector);
        _registerInterface(this.setERC1155WrapperModel.selector);
        _registerInterface(this.setERC20WrapperModel.selector);
        _registerInterface(this.setERC721WrapperModel.selector);
        _registerInterface(this.setMintFeePercentage.selector);
        _registerInterface(this.setBurnFeePercentage.selector);
        _registerInterface(this.createNative.selector);
        _registerInterface(this.createWrappedERC1155.selector);
        _registerInterface(this.createWrappedERC20.selector);
        _registerInterface(this.createWrappedERC721.selector);
    }

    function ethItemERC20WrapperModel() public override view returns (address ethItemERC20WrapperModelAddress, uint256 ethItemERC20WrapperModelVersion) {
        return (_ethItemERC20WrapperModelAddress, IERC20NFTWrapper(_ethItemERC20WrapperModelAddress).itemModelVersion());
    }

    function setEthItemERC20WrapperModel(address ethItemERC20WrapperModelAddress) public override byOrchestrator {
        _ethItemERC20WrapperModelAddress = ethItemERC20WrapperModelAddress;
    }

    function nativeModel() public override view returns (address nativeModelAddress, uint256 nativeModelVersion) {
        return (_nativeModelAddress, IEthItemModelBase(_nativeModelAddress).modelVersion());
    }

    function setNativeModel(address nativeModelAddress) public override byOrchestrator {
        _nativeModelAddress = nativeModelAddress;
    }

    function erc1155WrapperModel() public override view returns (address erc1155WrapperModelAddress, uint256 erc1155WrapperModelVersion) {
        return (_erc1155WrapperModelAddress, IEthItemModelBase(_erc1155WrapperModelAddress).modelVersion());
    }

    function setERC1155WrapperModel(address erc1155WrapperModelAddress) public override byOrchestrator {
        _erc1155WrapperModelAddress = erc1155WrapperModelAddress;
    }

    function erc20WrapperModel() public override view returns (address erc20WrapperModelAddress, uint256 erc20WrapperModelVersion) {
        return (_erc20WrapperModelAddress, IEthItemModelBase(_erc20WrapperModelAddress).modelVersion());
    }

    function setERC20WrapperModel(address erc20WrapperModelAddress) public override byOrchestrator {
        _erc20WrapperModelAddress = erc20WrapperModelAddress;
    }

    function erc721WrapperModel() public override view returns (address erc721WrapperModelAddress, uint256 erc721WrapperModelVersion) {
        return (_erc721WrapperModelAddress, IEthItemModelBase(_erc721WrapperModelAddress).modelVersion());
    }

    function setERC721WrapperModel(address erc721WrapperModelAddress) public override byOrchestrator {
        _erc721WrapperModelAddress = erc721WrapperModelAddress;
    }

    function mintFeePercentage() public override view returns (uint256 mintFeePercentageNumerator, uint256 mintFeePercentageDenominator) {
        return (_mintFeePercentage[0], _mintFeePercentage[1]);
    }

    function setMintFeePercentage(uint256 mintFeePercentageNumerator, uint256 mintFeePercentageDenominator) public override byOrchestrator {
        _mintFeePercentage[0] = mintFeePercentageNumerator;
        _mintFeePercentage[1] = mintFeePercentageDenominator;
    }

    function calculateMintFee(uint256 amountInDecimals) public override view returns (uint256 mintFee, address dfoWalletAddress) {
        if(_mintFeePercentage[0] == 0 || _mintFeePercentage[1] == 0) {
            return (0, address(0));
        }
        mintFee = ((amountInDecimals * _mintFeePercentage[0]) / _mintFeePercentage[1]);
        require(mintFee > 0, "Inhexistent mint fee, amount too low.");
        dfoWalletAddress = IMVDProxy(IDoubleProxy(_doubleProxy).proxy()).getMVDWalletAddress();
    }

    function burnFeePercentage() public override view returns (uint256 burnFeePercentageNumerator, uint256 burnFeePercentageDenominator) {
        return (_burnFeePercentage[0], _burnFeePercentage[1]);
    }

    function setBurnFeePercentage(uint256 burnFeePercentageNumerator, uint256 burnFeePercentageDenominator) public override byOrchestrator {
        _burnFeePercentage[0] = burnFeePercentageNumerator;
        _burnFeePercentage[1] = burnFeePercentageDenominator;
    }

    function calculateBurnFee(uint256 amountInDecimals) public override view returns (uint256 burnFee, address dfoWalletAddress) {
        if(_burnFeePercentage[0] == 0 || _burnFeePercentage[1] == 0) {
            return (0, address(0));
        }
        burnFee = ((amountInDecimals * _burnFeePercentage[0]) / _burnFeePercentage[1]);
        require(burnFee > 0, "Inhexistent burn fee, amount too low.");
        dfoWalletAddress = IMVDProxy(IDoubleProxy(_doubleProxy).proxy()).getMVDWalletAddress();
    }

    function createNative(bytes memory modelInitCallPayload) public override byOrchestrator returns (address newNativeAddress, bytes memory modelInitCallResponse) {
        bool modelInitCallResult = false;
        (modelInitCallResult, modelInitCallResponse) = (newNativeAddress = _clone(_nativeModelAddress)).call(modelInitCallPayload);
        require(modelInitCallResult, "Model Init call failed");
        IEthItemModelBase createdToken = IEthItemModelBase(newNativeAddress);
        (, uint256 itemModelVersion) = createdToken.erc20NFTWrapperModel();
        uint256 modelVersion = createdToken.modelVersion();
        emit NewNativeCreated(createdToken.standardVersion(), itemModelVersion, modelVersion, newNativeAddress);
        emit NewNativeCreated(_nativeModelAddress, modelVersion, newNativeAddress, msg.sender);
    }

    function createWrappedERC1155(bytes memory modelInitCallPayload) public override byOrchestrator returns (address newERC1155WrapperAddress, bytes memory modelInitCallResponse) {
        bool modelInitCallResult = false;
        (modelInitCallResult, modelInitCallResponse) = (newERC1155WrapperAddress = _clone(_erc1155WrapperModelAddress)).call(modelInitCallPayload);
        require(modelInitCallResult, "Model Init call failed");
        IEthItemModelBase createdToken = IEthItemModelBase(newERC1155WrapperAddress);
        (, uint256 itemModelVersion) = createdToken.erc20NFTWrapperModel();
        uint256 modelVersion = createdToken.modelVersion();
        emit NewWrappedERC1155Created(createdToken.standardVersion(), itemModelVersion, modelVersion, newERC1155WrapperAddress);
        emit NewWrappedERC1155Created(_erc1155WrapperModelAddress, modelVersion, newERC1155WrapperAddress, msg.sender);
    }

    function createWrappedERC20(bytes memory modelInitCallPayload) public override byOrchestrator returns (address newERC20Address, bytes memory modelInitCallResponse) {
        bool modelInitCallResult = false;
        (modelInitCallResult, modelInitCallResponse) = (newERC20Address = _clone(_erc20WrapperModelAddress)).call(modelInitCallPayload);
        require(modelInitCallResult, "Model Init call failed");
        IEthItemModelBase createdToken = IEthItemModelBase(newERC20Address);
        (, uint256 itemModelVersion) = createdToken.erc20NFTWrapperModel();
        uint256 modelVersion = createdToken.modelVersion();
        emit NewWrappedERC20Created(createdToken.standardVersion(), itemModelVersion, modelVersion, newERC20Address);
        emit NewWrappedERC20Created(_erc20WrapperModelAddress, modelVersion, newERC20Address, msg.sender);
    }

    function createWrappedERC721(bytes memory modelInitCallPayload) public override byOrchestrator returns (address newERC721Address, bytes memory modelInitCallResponse) {
        bool modelInitCallResult = false;
        (modelInitCallResult, modelInitCallResponse) = (newERC721Address = _clone(_erc721WrapperModelAddress)).call(modelInitCallPayload);
        require(modelInitCallResult, "Model Init call failed");
        IEthItemModelBase createdToken = IEthItemModelBase(newERC721Address);
        (, uint256 itemModelVersion) = createdToken.erc20NFTWrapperModel();
        uint256 modelVersion = createdToken.modelVersion();
        emit NewWrappedERC721Created(createdToken.standardVersion(), itemModelVersion, modelVersion, newERC721Address);
        emit NewWrappedERC721Created(_erc721WrapperModelAddress, modelVersion, newERC721Address, msg.sender);
    }

    function _clone(address original) internal returns (address copy) {
        assembly {
            mstore(
                0,
                or(
                    0x5880730000000000000000000000000000000000000000803b80938091923cF3,
                    mul(original, 0x1000000000000000000)
                )
            )
            copy := create(0, 0, 32)
            switch extcodesize(copy)
                case 0 {
                    invalid()
                }
        }
    }
}