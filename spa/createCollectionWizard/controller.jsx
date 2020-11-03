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
        if (exists) {
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
        if (collectionENS) {
            exists = await window.blockchainCall(window.ENSController.methods.recordExists, nameHash.hash(nameHash.normalize(`${collectionENS}.${window.context.ensDomainName}`)));
        }
        return [collectionENS, exists];
    };

    context.checkStep1 = async function checkStep1() {
        await window.waitForLateInput();
        var state = context.view.getState();
        if (!state.extension) {
            throw "No owner! Are you serious?";
        }
        if (state.extension !== 'wallet') {
            return;
        }
        var extensionAddress = context.view.extensionAddressInput.value;
        if (!extensionAddress || !window.isEthereumAddress(extensionAddress)) {
            throw "Extension must be a valid ethereum address!";
        }
        context.view.setState({
            extensionAddress
        });
    };

    context.checkStep2 = async function checkStep2() {
        context.view.setState({
            hasDecimals: context.view.hasDecimals.checked
        });
    };

    context.checkStep3 = async function checkStep3() {
        var state = context.view.getState();
        if (!state.metadataType) {
            throw "No metadata! Are you serious?";
        }
        if (state.metadataType === 'custom') {
            var metadataLink = context.view.metadataLinkInput.value;
            if (!metadataLink || !await window.checkMetadataLink(metadataLink)) {
                throw "Not a valid metadata link!";
            }
            context.view.setState({
                metadataLink
            });
        }
        var metadata = await context.view.getMetadataValues();
        if(!await window.checkMetadataValuesForCollection(metadata)) {
            throw "Invalid metadata values";
        }
        context.view.setState({
            metadata
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
        } catch (e) {
        }
        if (!contract) {
            throw "You must compile and select a valid contract";
        }
        var extensionAddress = context.view.getState().extensionAddress;
        if (extensionAddress && window.isEthereumAddress(extensionAddress)) {
            var compare = await window.SolidityUtilities.compare(extensionAddress, code);
            if (!compare || Object.values(compare).length === 0) {
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
        var metadataLink = state.metadataLink;
        var metatada = state.metadata || {};
        if(state.extension === 'contract') {
            metatada = metatada || await window.AJAXRequest(window.formatLink(metadataLink));
            metatada.code = context.view.editor.editor.getValue();
        }
        metadataLink = metadataLink || await window.uploadMetadata(metatada);
        var params = ["string", "string", "bool", "string", "address", "bytes"];
        var values = [state.collectionName, state.collectionSymbol, state.hasDecimals, metadataLink, extensionAddress || window.voidEthereumAddress, context.view.extensionAddressPayload && context.view.extensionAddressPayload.value || "0x"];
        var payload = window.web3.utils.sha3(`init(${params.join(",")})`);
        payload = payload.substring(0, 10) + window.web3.eth.abi.encodeParameters(params, values).substring(2);
        await window.blockchainCall(window.ethItemOrchestrator.methods.createERC1155, payload, state.collectionENS);
        context.view.emit('collections/refresh');
    };
};