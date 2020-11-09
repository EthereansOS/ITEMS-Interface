var CreateCollectionWizardController = function (view) {
    var context = this;
    context.view = view;

    context.checkStep0 = async function checkStep0() {
        await window.waitForLateInput();
        var collectionName = context.view.collectionName.value;
        if (!collectionName) {
            throw "mmm... Your Collection deserves a name";
        }

        var collectionSymbol = context.view.collectionSymbol.value;
        if (!collectionSymbol) {
            throw "The Collection symbol is important! Dont forget it";
        }

        var collectionENS = "";

        /*var ensResult = await context.checkENS();
        collectionENS = ensResult[0];
        if (!collectionENS) {
            throw "ENS is mandatory";
        }

        var exists = ensResult[1];
        if (exists) {
            throw "This ENS is already taken!";
        }*/

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
            throw "No host! Are you serious?";
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
        if (!await window.checkMetadataValuesForCollection(metadata)) {
            throw "Looks like you have insered some ivalid inputs as Metadata";
        }
        context.view.setState({
            metadata
        });
    };

    context.performDeploySmartContract = async function performDeploySmartContract() {
        var code = "";
        try {
            code = context.view.editor.editor.getValue();
        } catch (e) {
        }
        if (!code) {
            throw "Please provide the source of the Extension, be a good Etherean!";
        }
        var compilation = await window.SolidityUtilities.compile(code, context.view.editor.solidityVersion.value, 200);
        var contract;
        try {
            contract = compilation[context.view.contractSelect.value];
        } catch (e) {
        }
        if (!contract) {
            throw "You must compile and select a valid contract to deploy";
        }
        context.view.setState({loadingMessage : "Deploying Smart Contract"});
        var deployedContract = await window.createContract(contract.abi, contract.bytecode);
        context.view.setState({
            code,
            extensionAddress: deployedContract.options.address
        });
    };

    context.performDeploy = async function performDeploy() {
        var state = context.view.getState();
        var extensionAddress = state.extensionAddress;
        var metadata = state.metadata || await window.AJAXRequest(window.formatLink(state.metadataLink));

        if(state.extension === 'contract') {
            var compare = await window.SolidityUtilities.compare(extensionAddress, state.code);
            if (!compare || Object.values(compare).length === 0) {
                throw 'Contract source code and given extension address are not aligned';
            }
            state.extension === 'contract' && (metadata.extensionCode = state.code);
        }

        metadata.name = state.collectionName;
        metadata.symbol = state.collectionSymbol;
        metadata.decimals = state.hasDecimals ? 18 : 1;
        metadata.hasDecimals = state.hasDecimals;
        metadata.originalCreator = window.web3.utils.toChecksumAddress(window.walletAddress);
        metadata.extensionAddress = extensionAddress;
        //metadata.external_url = `${state.collectionENS}.${window.context.ensDomainName}`;
        context.view.setState({loadingMessage : "1/2 - Uploading metadata to IPFS"});
        var metadataLink = await window.uploadMetadata(metadata);
        var params = ["string", "string", "bool", "string", "address", "bytes"];
        var values = [state.collectionName, state.collectionSymbol, state.hasDecimals, metadataLink, extensionAddress || window.voidEthereumAddress, context.view.extensionAddressPayload && context.view.extensionAddressPayload.value || "0x"];
        var payload = window.web3.utils.sha3(`init(${params.join(",")})`);
        payload = payload.substring(0, 10) + window.web3.eth.abi.encodeParameters(params, values).substring(2);
        context.view.setState({loadingMessage : "2/2 Deploy Collection"});
        var transaction = await window.blockchainCall(window.ethItemOrchestrator.methods.createERC1155, payload, state.collectionENS);
        context.view.emit('collections/refresh');
        var events = transaction.events;
        if(!(events instanceof Array)) {
            events = Object.values(events);
        }
        var factoryAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.ethItemOrchestrator.methods.factory));
        var topic = window.web3.utils.sha3(Object.entries(window.context.ethItemFactoryEvents).filter(it => it[1] === "NativeABI").map(it => it[0])[0]);
        var collectionAddress;
        for(var event of events) {
            if(window.web3.utils.toChecksumAddress(event.address) !== factoryAddress) {
                continue;
            }
            if(event.raw.topics[0] !== topic) {
                continue;
            }
            collectionAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", event.raw.topics[3]));
            break;
        }
        var collection = await window.loadSingleCollection(collectionAddress);
        var newMetadata = await window.AJAXRequest(window.formatLink(metadataLink));
        var collectionAndItem = {
            name : newMetadata.name,
            image : newMetadata.image,
            external_url : newMetadata.external_url,
            collection,
            collectionAddress
        }
        collectionAndItem.created = 'collection';
        context.view.emit('section/change', 'spa/successPage', collectionAndItem);
    };
};