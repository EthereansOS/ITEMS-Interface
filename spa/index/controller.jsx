var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        context.loadItems(true);
    };

    context.loadItems = async function loadItems(clear) {
        clear && context.view.setState({items : null});
        (!context.view.state || !context.view.state.items) && context.view.setState({itemsLoading : true});
        var map = {};
        Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
        var topics = [Object.keys(map)];
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        var items = (context.view.state && context.view.state.items) || [];
        var blocks = await context.loadBlockSearchTranches();
        var updatePromise = function(subItems) {
            return new Promise(function(ok) {
                items.push(...subItems);
                context.view.setState({items}, () => context.refreshUserData(subItems).then(ok));
            });
        }
        var promises = [];
        for(var block of blocks) {
            var subItems = [];
            var logs = await window.getLogs({
                address,
                topics,
                fromBlock : block[0],
                toBlock : block[1]
            });
            for(var log of logs) {
                var address = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", log.topics[log.topics.length - 1]));
                var abi = window.context[map[log.topics[0]]];
                var category = map[log.topics[0]];
                category = category.substring(1, category.length - 3);
                var contract = window.newContract(abi, address);
                var ethItem = {
                    key : log.blockNumber + "_" + address,
                    address,
                    category,
                    contract
                }
                subItems.push(ethItem);
            }
            promises.push(updatePromise(subItems));
        }
        await Promise.all(promises);
        context.view.setState({itemsLoading : null})
    };

    context.loadBlockSearchTranches = async function loadBlockSearchTranches() {
        var startBlock = parseInt(window.numberToString(window.getNetworkElement("deploySearchStart") || "0"));
        var endBlock = parseInt(window.numberToString(await window.web3.eth.getBlockNumber()));
        var limit = window.context.blockSearchLimit;
        var toBlock = endBlock;
        var fromBlock = endBlock - limit;
        fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
        var blocks = [];
        while(true) {
            blocks.push([window.numberToString(fromBlock), window.numberToString(toBlock)]);
            if(fromBlock === startBlock) {
                break;
            }
            toBlock = fromBlock - 1;
            fromBlock = toBlock - limit;
            fromBlock = fromBlock < startBlock ? startBlock : fromBlock;
        }
        return blocks;
    };

    context.refreshUserData = async function refreshUserData(items) {
        items = items || context.view.state.items;
        for(var item of items) {
            console.log(item);
        }
        context.view.setState({items : context.view.state.items});
    }
};