var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.tryCheckAddressBarParams = async function tryCheckAddressBarParams() {
        var collectionAddress = window.consumeAddressBarParam("collection");
        var interoperableAddress = window.consumeAddressBarParam("interoperable");
        if(!collectionAddress && !interoperableAddress) {
            return;
        }
        context.view.setState({ loadingCollections: true });
        var objectId = window.consumeAddressBarParam("item");
        if(interoperableAddress) {
            var interoperable = window.newContract(window.context.IEthItemInteroperableInterfaceABI, interoperableAddress);
            objectId = await window.blockchainCall(interoperable.methods.objectId);
            try {
                collectionAddress = await window.blockchainCall(interoperable.methods.mainInterface);
            } catch(e) {
                collectionAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.IERC20ItemWrapperABI, interoperableAddress).methods.mainWrapper));
            }
        }
        var props = {collection : await window.loadSingleCollection(collectionAddress)};
        (props.objectId = objectId) && (props.item = await window.loadItemData(props));
        context.view.emit('section/change', `spa/${props.item ? 'item' : 'collection'}`, props);
        return true;
    };

    context.loadData = async function loadData() {
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        try {
            window.currentEthItemKnowledgeBase = window.newContract(window.context.KnowledgeBaseABI, await window.blockchainCall(window.ethItemOrchestrator.methods.knowledgeBase));
        } catch (e) {
        }
        try {
            window.currentEthItemFactory = window.newContract(window.context.IEthItemFactoryABI, await window.blockchainCall(window.ethItemOrchestrator.methods.factory));
        } catch (e) {
        }
        try {
            window.currentEthItemERC20Wrapper = window.newContract(window.context.W20ABI, await window.blockchainCall(window.currentEthItemKnowledgeBase.methods.erc20Wrapper));
        } catch (e) {
        }
        try {
            window.ENSController = window.newContract(window.context.ENSABI, window.context.ENSControllerAddres);
        } catch (e) {
        }
        await context.tryCheckAddressBarParams();
        await context.loadCollections(true);
    };

    context.loadCollections = async function loadCollections(clear) {
        window.context.excludingCollections = (window.context.excludingCollections || []).map(it => web3.utils.toChecksumAddress(it));
        clear && context.view.setState({ collections: null });
        (!context.view.state || !context.view.state.collections) && context.view.setState({ loadingCollections: true });
        var map = {};
        Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
        var topics = [Object.keys(map)];
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        (window.getNetworkElement("additionalFactories") || []).map(it => window.web3.utils.toChecksumAddress(it)).filter(it => address.indexOf(it) === -1).forEach(it => address.push(it));
        var collections = [];
        var blocks = await window.loadBlockSearchTranches();
        var updateSubCollectionsPromise = function updateSubCollectionsPromise(subCollections) {
            return new Promise(function (ok, ko) {
                collections.push(...subCollections);
                context.view.setState({ collections }, () => context.refreshCollectionData(subCollections).then(ok).catch(ko));
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
                var modelAddress = window.web3.eth.abi.decodeParameter("address", log.topics[1]);
                var collectionAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", log.topics[log.topics.length - 1]));
                if(window.context.excludingCollections.indexOf(collectionAddress) !== -1) {
                    continue;
                }
                var category = map[log.topics[0]];
                subCollections.push(window.packCollection(collectionAddress, category, modelAddress));
            }
            subCollectionsPromises.push(updateSubCollectionsPromise(subCollections));
        }
        await Promise.all(subCollectionsPromises);
        context.view.setState({ loadingCollections: null });
        context.view.emit('collections/refreshed');
    };

    context.refreshCollectionData = async function refreshCollectionData(collections) {
        collections = collections || context.view.state.collections;
        if (!collections) {
            return;
        }
        for (var collection of collections) {
            collection.items && Object.values(collection.items).forEach(it => delete it.dynamicData);
        }
        context.view.setState({ collections: context.view.state.collections });
        var promises = [];
        for (var collection of collections) {
            promises.push(window.refreshSingleCollection(collection, context.view));
        }
        await Promise.all(promises);
        context.view.setState({ collections: context.view.state.collections });
    };
};