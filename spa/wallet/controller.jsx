var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        context.view.setState({ loaded : false }, () => context.view.emit('wallet/update'));
        var address = context.view.props.collections.map(it => window.web3.utils.toChecksumAddress(it.address));
        var blocks = await window.loadBlockSearchTranches();
        var events = [
            window.web3.utils.sha3("TransferSingle(address,address,address,uint256,uint256)"),
            window.web3.utils.sha3("TransferBatch(address,address,address,uint256[],uint256[])"),
        ];
        var topics = [
            events,
            [],
            [],
            window.web3.eth.abi.encodeParameter("address", window.walletAddress)
        ];
        var idsOfCollection = {};
        var promises = [];
        for(var block of blocks) {
            var logs = await window.getLogs({
                address,
                topics,
                fromBlock: block[0],
                toBlock: block[1]
            });
            for(var log of logs) {
                idsOfCollection[log.address] = idsOfCollection[log.address] || {};
                var collection = context.view.props.collections.filter(it => it.address === log.address)[0];
                collection.items = collection.items || {};
                var objectIds = [];
                if(log.topics[0] === events[0]) {
                    objectIds = [window.web3.eth.abi.decodeParameters(["uint256", "uint256"], log.data)[0]];
                }
                if(log.topics[0] === events[1]) {
                    objectIds = window.web3.eth.abi.decodeParameters(["uint256[]", "uint256[]"], log.data)[0];
                }
                for(var objectId of objectIds) {
                    if(idsOfCollection[log.address][objectId]) {
                        continue;
                    }
                    idsOfCollection[log.address][objectId] = true;
                    promises.push(window.loadItemData(collection.items[objectId] = collection.items[objectId] || {
                        objectId,
                        collection
                    }, collection, context.view));
                }
            }
        }
        await Promise.all(promises);
        context.view.setState({ loaded : true }, () => context.view.emit('wallet/update'));
    };
};