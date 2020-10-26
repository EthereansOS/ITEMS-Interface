var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        context.loadCollections(true);
    };

    context.loadCollections = async function loadCollections(clear) {
        clear && context.view.setState({ collections: null });
        (!context.view.state || !context.view.state.collections) && context.view.setState({ collectionsLoading: true });
        var map = {};
        Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
        var topics = [Object.keys(map)];
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        var collections = (context.view.state && context.view.state.collections) || [];
        var blocks = await context.loadBlockSearchTranches();
        var updateSubCollectionsPromise = function updateSubCollectionsPromise(subC) {
            return new Promise(function (ok) {
                collections.push(...subC);
                context.view.setState({ collections }, () => context.refreshCollectionData(subC).then(ok));
            });
        }
        var subCollectionsPromises = [];
        for (var block of blocks) {
            var subCollections = [];
            var logs = await window.getLogs({
                address,
                topics,
                fromBlock: block[0],
                toBlock: block[1]
            });
            for (var log of logs) {
                var address = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", log.topics[log.topics.length - 1]));
                var abi = window.context[map[log.topics[0]]];
                var category = map[log.topics[0]];
                category = category.substring(1, category.length - 3);
                var contract = window.newContract(abi, address);
                var collection = {
                    key: log.blockNumber + "_" + address,
                    address,
                    category,
                    contract
                }
                subCollections.push(collection);
            }
            subCollectionsPromises.push(updateSubCollectionsPromise(subCollections));
        }
        await Promise.all(subCollectionsPromises);
        context.view.setState({ collectionsLoading: null })
    };

    context.loadBlockSearchTranches = async function loadBlockSearchTranches() {
        var startBlock = parseInt(window.numberToString(window.getNetworkElement("deploySearchStart") || "0"));
        var endBlock = parseInt(window.numberToString(await window.web3.eth.getBlockNumber()));
        var limit = window.context.blockSearchLimit;
        var toBlock = endBlock;
        var fromBlock = endBlock - limit;
        fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
        var blocks = [];
        while (true) {
            blocks.push([window.numberToString(fromBlock), window.numberToString(toBlock)]);
            if (fromBlock === startBlock) {
                break;
            }
            toBlock = fromBlock - 1;
            fromBlock = toBlock - limit;
            fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
        }
        return blocks;
    };

    context.refreshCollectionData = async function refreshCollectionData(collections) {
        collections = collections || context.view.state.collections;
        for (var collection of collections) {
            collection.name = collection.name || await window.blockchainCall(collection.contract.methods.name);
            collection.symbol = collection.symbol || await window.blockchainCall(collection.contract.methods.symbol);
            await context.tryRetrieveMetadata(collection);
            collection.loaded = true;
        }
        context.view.setState({ collections: context.view.state.collections });
    };

    context.tryRetrieveMetadata = async function tryRetrieveMetadata(collection) {
        if (collection.metadataLink || window.context.collectionsWithMetadata.indexOf(collection.category) === -1) {
            return;
        }
        var clearMetadata = true;
        try {
            collection.metadataLink = await window.blockchainCall(collection.contract.methods.uri);
            if (collection.metadataLink !== "") {
                collection.metadata = await window.AJAXRequest(window.formatLink(collection.metadataLink));
                if (typeof collection.metadata !== "string") {
                    Object.entries(collection.metadata).forEach(it => collection[it[0]] = it[1]);
                    collection.name = collection.collection_name || collection.name;
                    clearMetadata = false;
                }
            }
        } catch (e) {
        }
        clearMetadata && delete collection.metadata;
        clearMetadata && (collection.metadataLink = clearMetadata ? "blank" : collection.metadataLink);
    };
};