var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        window.ethItemOrchestrator = window.newContract(window.context.ethItemOrchestratorABI, window.getNetworkElement("ethItemOrchestratorAddress"));
        var map = {};
        Object.entries(window.context.ethItemFactoryEvents).forEach(it => map[window.web3.utils.sha3(it[0])] = it[1]);
        var topics = [Object.keys(map)];
        var address = await window.blockchainCall(window.ethItemOrchestrator.methods.factories);
        var logs = await window.getLogs({
            address,
            topics
        });
        for(var log of logs) {
            var ethItemAddress = log.topics[log.topics.length - 1];
            ethItemAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter("address", ethItemAddress));
            console.log(ethItemAddress, map[log.topics[0]]);
        }
    };
};