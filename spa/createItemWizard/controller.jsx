var CreateItemWizardController = function (view) {
    var context = this;
    context.view = view;

    context.newERC1155CreatedEvent = "NewERC1155Created(address,uint256,address,address)";

    context.onTokenAddressChange = async function(address) {
        try {
            address = window.web3.utils.toChecksumAddress(address);
        } catch(e) {
            return context.view.setState({selectedToken : null});
        }
        var factories = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        var logs = await window.getLogs({
            factories,
            topics : [
                [window.web3.utils.sha3(context.newERC1155CreatedEvent)],
                [],
                [],
                [window.web3.eth.abi.encodeParameter("address", address)]
            ]
        });
        if(logs.length === 0) {
            return context.view.setState({selectedToken : null});
        }
        var selectedToken = {
            address,
            contract : window.newContract(window.context.IERC1155ABI, address),
        };
        try {
            selectedToken.name = await window.blockchainCall(selectedToken.contract.methods.name);
        } catch(e) {
        }
        try {
            selectedToken.symbol = await window.blockchainCall(selectedToken.contract.methods.symbol);
        } catch(e) {
        }
        try {
            selectedToken.decimals = await window.blockchainCall(selectedToken.contract.methods.decimals);
        } catch(e) {
        }
        try {
            selectedToken.extension = window.web3.utils.toChecksumAddress(await window.blockchainCall(selectedToken.contract.methods.extension));
        } catch(e) {
        }
        try {
            selectedToken.canMint = await window.blockchainCall(selectedToken.contract.methods.canMint, window.walletAddress);
        } catch(e) {
        }
        return context.view.setState({selectedToken});
    };

    context.checkStep1 = function checkStep1() {
        var itemName = context.view.itemName.value;
        var itemSymbol = context.view.itemSymbol.value;
        var itemSupply = context.view.itemSupply.value;
        var itemMintable = context.view.itemMintable.checked;
        if(window.asNumber(itemSupply) <= 0) {
            throw "Supply must be a number greater than 0";
        }
        context.view.setState({
            itemName,
            itemSymbol,
            itemSupply,
            itemMintable
        });
    };

    context.toDecimals = function toDecimals(selectedToken, value) {
        if(!selectedToken || !value) {
            return;
        }
        if(selectedToken.decimals && window.asNumber(selectedToken.decimals) > 1) {
            value = window.toDecimals(value, selectedToken.decimals);
        }
        return value.split(',').join('');
    };

    context.checkMetadata = async function checkMetadata() {
        var state = context.view.getState();
        if (!state.metadataType) {
            throw "No metadata! Are you serious?";
        }
        if (state.metadataType === 'custom') {
            await window.waitForLateInput();
            var metadataLink = context.view.metadataLinkInput.value;
            if (!metadataLink || !await window.checkMetadataLink(metadataLink)) {
                throw "Not a valid metadata link!";
            }
            return context.view.setState({
                metadataLink
            });
        }
        var metadata = await context.view.getMetadataValues();
        if(!await window.checkMetadataValuesForItem(metadata)) {
            throw "Invalid metadata values";
        }
        context.view.setState({
            metadata
        });
    };

    context.performDeploy = async function performDeploy() {
        await context.checkMetadata();
        var state = context.view.getState();
        var valueDecimals = context.toDecimals(state.selectedToken, state.itemSupply);
        if(parseInt(valueDecimals) <= 0) {
            throw "Supply must be greater than 0";
        }
        var metadataLink = state.metadataLink || await window.uploadMetadata(state.metatada);
        await window.blockchainCall(state.selectedToken.contract.methods.mint, valueDecimals, state.itemName, state.itemSymbol, metadataLink, state.itemMintable);
    };
};