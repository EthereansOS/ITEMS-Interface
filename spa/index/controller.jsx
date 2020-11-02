var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        try {
            window.currentEthItemKnowledgeBase = window.newContract(window.context.KnowledgeBaseABI, await window.blockchainCall(window.ethItemOrchestrator.methods.knowledgeBase));
        } catch(e) {
        }
        try {
            window.currentEthItemFactory = window.newContract(window.context.IEthItemFactoryABI, await window.blockchainCall(window.ethItemOrchestrator.methods.factory));
        } catch(e) {
        }
        try {
            window.currentEthItemERC20Wrapper = window.newContract(window.context.IERC20WrapperABI, await window.blockchainCall(window.currentEthItemKnowledgeBase.methods.erc20Wrapper));
        } catch(e) {
        }
        try {
            window.ENSController = window.newContract(window.context.ENSABI, window.context.ENSControllerAddres);
        } catch(e) {
        }
        await context.loadCollections(true);
    };

    context.loadCollections = async function loadCollections(clear) {
        clear && context.view.setState({ collections: null });
        (!context.view.state || !context.view.state.collections) && context.view.setState({ loadingCollections: true });
        var map = {};
        Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
        var topics = [Object.keys(map)];
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        var collections = (context.view.state && context.view.state.collections) || [];
        var blocks = await window.loadBlockSearchTranches();
        var updateSubCollectionsPromise = function updateSubCollectionsPromise(subCollections) {
            return new Promise(function(ok) {
                collections.push(...subCollections);
                context.view.setState({ collections }, () => context.refreshCollectionData(subCollections).then(ok));
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
                    index : collections.length + subCollections.length,
                    address,
                    category,
                    contract
                }
                subCollections.push(collection);
            }
            subCollectionsPromises.push(updateSubCollectionsPromise(subCollections));
        }
        await Promise.all(subCollectionsPromises);
        context.view.setState({ loadingCollections: null })
    };

    context.refreshCollectionData = async function refreshCollectionData(collections) {
        collections = collections || context.view.state.collections;
        if(!collections) {
            return;
        }
        var promises = [];
        for (var collection of collections) {
            promises.push(window.refreshSingleCollection(collection, context.view));
        }
        await Promise.all(promises);
        context.view.setState({ collections: context.view.state.collections });
    };
};