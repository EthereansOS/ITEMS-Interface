var CreateCollectionWizardController = function (view) {
    var context = this;
    context.view = view;

    context.checkStep0 = async function checkStep0() {
        await window.waitForLateInput();
        var collectionName = context.view.collectionName.value;
        if (!collectionName) {
            throw "Name is mandatory";
        }
        var collectionSymbol = context.view.collectionSymbol.value;
        if (!collectionSymbol) {
            throw "Symbol is mandatory";
        }
        var ensResult = await context.checkENS();
        var collectionENS = ensResult[0];
        if (!collectionENS) {
            throw "ENS is mandatory";
        }

        var exists = ensResult[1];
        if(exists) {
            throw "This ENS is already taken!";
        }

        context.view.setState({
            collectionName,
            collectionSymbol,
            collectionENS
        });
    };

    context.checkENS = async function checkENS() {
        var collectionENS = context.view.collectionENS.value;
        var exists = false;
        if(collectionENS) {
            exists = await window.blockchainCall(window.ENSController.methods.recordExists, nameHash.hash(nameHash.normalize(`${collectionENS}.${window.context.ensDomainName}`)));
        }
        return [collectionENS, exists];
    };

    context.checkStep1 = async function checkStep1() {
        await window.waitForLateInput();
        var state = context.view.getState();
        var extension = state.extension || "wallet";
        var hasDecimals = context.view.hasDecimals.checked;

        var metadataLink = context.view.metadataLinkInput.value;
        if(!await window.checkMetadataLink(metadataLink)) {
            throw "Not a valid metadata Link";
        }

        var extensionAddress = context.view.extensionAddressInput.value;
        if(extension === 'wallet' && (!extensionAddress || !window.isEthereumAddress(extensionAddress))) {
            throw 'Extension address is mandatory';
        }
        context.view.setState({
            hasDecimals,
            metadataLink,
            extensionAddress
        });
    };

    context.performDeploy = async function performDeploy() {
        var state = context.view.getState();
        var extension = state.extension || "wallet";
        var extensionAddress = state.extensionAddress;
        if (extension === "wallet") {
            return await context.finalizeDeploy(extensionAddress);
        }
        await context.deployContract();
    };

    context.deployContract = async function deployContract() {
        var code = "";
        try {
            code = context.view.editor.editor.getValue();
        } catch (e) {
        }
        if (!code) {
            throw "Extension source code is mandatory";
        }
        var compilation = await window.SolidityUtilities.compile(code, context.view.editor.solidityVersion.value, 200);
        var contract;
        try {
            contract = compilation[context.view.contractSelect.value];
        } catch(e) {
        }
        if(!contract) {
            throw "You must compile and select a valid contract";
        }
        var extensionAddress = context.view.getState().extensionAddress;
        if(extensionAddress && window.isEthereumAddress(extensionAddress)) {
            var compare = await window.SolidityUtilities.compare(extensionAddress, code);
            if(!compare || Object.values(compare).length === 0) {
                throw 'Contract source code and given extension address are not aligned';
            }
            return await context.finalizeDeploy(extensionAddress);
        }
        contract = await window.createContract(contract.abi, contract.bytecode);
        await context.finalizeDeploy(contract.options.address);
    };

    context.finalizeDeploy = async function finalizeDeploy(extensionAddress) {
        if (!extensionAddress || !window.isEthereumAddress(window.web3.utils.toChecksumAddress(extensionAddress))) {
            throw "Extension Address is mandatory";
        }
        var state = context.view.getState();

        var params = ["string", "string", "bool", "string", "address", "bytes"];
        var values = [state.collectionName, state.collectionSymbol, state.hasDecimals, state.metadataLink, extensionAddress || window.voidEthereumAddress, context.view.extensionAddressPayload && context.view.extensionAddressPayload.value || "0x"];
        var payload = window.web3.utils.sha3(`init(${params.join(",")})`);
        payload = payload.substring(0, 10) + window.web3.eth.abi.encodeParameters(params, values).substring(2);
        await window.blockchainCall(window.ethItemOrchestrator.methods.createERC1155, payload, state.collectionENS);
        context.view.emit('collections/refresh');
    };
};