var CreateCollectionWizardController = function (view) {
    var context = this;
    context.view = view;

    context.checkStep0 = async function checkStep0() {
        var collectionName = context.view.collectionName.value;
        if (!collectionName) {
            throw "Name is mandatory";
        }
        var collectionSymbol = context.view.collectionSymbol.value;
        if (!collectionSymbol) {
            throw "Symbol is mandatory";
        }
        var collectionENS = context.view.collectionENS.value;
        if (!collectionENS) {
            throw "ENS is mandatory";
        }

        context.view.setState({
            collectionName,
            collectionSymbol,
            collectionENS
        });
    };

    context.performDeploy = async function performDeploy() {
        var state = context.view.getState();
        var extension = state.extension || "wallet";
        var metadataLink = context.view.metadataLinkInput.value;
        if(!(await window.checkMetadataLink(metadataLink))) {
            throw "Invalid metadata link";
        }
        var extensionAddress = context.view.extensionAddressInput.value;
        if (extension === "wallet" || extensionAddress) {
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
        var contract = Object.values(compilation)[0];
        contract = await window.createContract(contract.abi, contract.bytecode);
        await context.finalizeDeploy(contract.options.address);
    };

    context.finalizeDeploy = async function finalizeDeploy(extensionAddress) {
        if (!extensionAddress || !window.isEthereumAddress(window.web3.utils.toChecksumAddress(extensionAddress))) {
            throw "Extension Address is mandatory";
        }
        var state = context.view.getState();

        var hasDecimals = context.view.hasDecimals.checked;
        var metadataLink = context.view.metadataLinkInput.value;
        var params = ["string", "string", "bool", "string", "address", "bytes"];
        var values = [state.collectionName, state.collectionSymbol, hasDecimals, metadataLink, extensionAddress || window.voidEthereumAddress, context.view.extensionAddressPayload && context.view.extensionAddressPayload.value || "0x"];
        var payload = window.web3.utils.sha3(`init(${params.join(",")})`);
        payload = payload.substring(0, 10) + window.web3.eth.abi.encodeParameters(params, values).substring(2);
        await window.blockchainCall(window.ethItemOrchestrator.methods.createERC1155, payload);
    };
};