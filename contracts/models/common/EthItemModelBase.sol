//SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IEthItemModelBase.sol";
import "eth-item-token-standard/EthItem.sol";
import "../../factory/IEthItemFactory.sol";

abstract contract EthItemModelBase is IEthItemModelBase, EthItem(address(0), "", "") {

    address internal _factoryAddress;

    function init(
        address,
        string memory,
        string memory
    ) public virtual override(IEthItem, EthItem) {
        revert("Cannot directly call this method.");
    }

    function init(
        string memory name,
        string memory symbol
    ) public override virtual {
        require(_factoryAddress == address(0), "Init already called!");
        (address ethItemERC20WrapperModelAddress,) = IEthItemFactory(_factoryAddress = msg.sender).ethItemERC20WrapperModel();
        super.init(ethItemERC20WrapperModelAddress, name, symbol);
    }

    function modelVersion() public override virtual pure returns(uint256) {
        return 1;
    }

    function factory() public override view returns (address) {
        return _factoryAddress;
    }

    function _sendMintFeeToDFO(address from, uint256 objectId, uint256 erc20WrapperAmount) internal virtual returns(uint256 mintFeeToDFO) {
        address dfoWallet;
        (mintFeeToDFO, dfoWallet) = IEthItemFactory(_factoryAddress).calculateMintFee(erc20WrapperAmount);
        if(mintFeeToDFO > 0 && dfoWallet != address(0)) {
            asERC20(objectId).transferFrom(from, dfoWallet, mintFeeToDFO);
        }
    }

    function _sendBurnFeeToDFO(address from, uint256 objectId, uint256 erc20WrapperAmount) internal virtual returns(uint256 burnFeeToDFO) {
        address dfoWallet;
        (burnFeeToDFO, dfoWallet) = IEthItemFactory(_factoryAddress).calculateBurnFee(erc20WrapperAmount);
        if(burnFeeToDFO > 0 && dfoWallet != address(0)) {
            asERC20(objectId).transferFrom(from, dfoWallet, burnFeeToDFO);
        }
    }

    function mint(uint256, string memory)
        public
        virtual
        override(IEthItem, EthItem)
        returns (uint256, address)
    {
        revert("Cannot directly call this method.");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 objectId,
        uint256 amount,
        bytes memory data
    ) public virtual override(IERC1155, EthItem) {
        require(to != address(0), "ERC1155: transfer to the zero address");
        address operator = _msgSender();
        require(
            from == operator || isApprovedForAll(from, operator),
            "ERC1155: caller is not owner nor approved"
        );

        _doERC20Transfer(from, to, objectId, amount);

        emit TransferSingle(operator, from, to, objectId, amount);

        _doSafeTransferAcceptanceCheck(
            operator,
            from,
            to,
            objectId,
            amount,
            data
        );
    }

    /**
     * @dev Classic ERC1155 Standard Method
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory objectIds,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override(IERC1155, EthItem) {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        for (uint256 i = 0; i < objectIds.length; i++) {
            _doERC20Transfer(from, to, objectIds[i], amounts[i]);
        }

        address operator = _msgSender();

        emit TransferBatch(operator, from, to, objectIds, amounts);

        _doSafeBatchTransferAcceptanceCheck(
            operator,
            from,
            to,
            objectIds,
            amounts,
            data
        );
    }

    function _doERC20Transfer(address from, address to, uint256 objectId, uint256 amount) internal virtual {
        (,uint256 result) = _getCorrectERC20ValueForTransferOrBurn(from, objectId, amount);
        asERC20(objectId).transferFrom(from, to, result);
    }

    function _getCorrectERC20ValueForTransferOrBurn(address from, uint256 objectId, uint256 amount) internal virtual view returns(uint256 balanceOfNormal, uint256 result) {
        uint256 toTransfer = toERC20WrapperAmount(objectId, amount);
        uint256 balanceOfDecimals = asERC20(objectId).balanceOf(from);
        balanceOfNormal = balanceOf(from, objectId);
        result = amount == balanceOfNormal ? balanceOfDecimals : toTransfer;
    }

    function _burn(
        uint256 objectId,
        uint256 amount
    ) internal virtual returns(uint256 burnt, uint256 burnFeeToDFO) {
        (uint256 balanceOfNormal, uint256 result) = _getCorrectERC20ValueForTransferOrBurn(msg.sender, objectId, amount);
        require(balanceOfNormal >= amount, "Insufficient Amount");
        burnFeeToDFO = _sendBurnFeeToDFO(msg.sender, objectId, result);
        asERC20(objectId).burn(msg.sender, burnt = result - burnFeeToDFO);
    }

    function _isUnique(uint256 objectId) internal virtual view returns (bool unique, uint256 unity, uint256 totalSupply, uint256 erc20Decimals) {
        erc20Decimals = asERC20(objectId).decimals();
        unity = erc20Decimals <= 1 ? 1 : (10**erc20Decimals);
        totalSupply = asERC20(objectId).totalSupply();
        unique = totalSupply <= unity;
    }

    function toEthItemAmount(uint256 objectId, uint256 erc20WrapperAmount) public virtual view override(IEthItem, EthItem) returns (uint256 ethItemAmount) {
        (bool unique, uint256 unity,, uint256 erc20Decimals) = _isUnique(objectId);
        if(unique && erc20WrapperAmount < unity) {
            uint256 half = (unity * 51) / 100;
            return ethItemAmount = erc20WrapperAmount <= half ? 0 : 1;
        }
        return ethItemAmount = erc20WrapperAmount / (10**erc20Decimals);
    }
}