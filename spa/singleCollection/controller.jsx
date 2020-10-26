var SingleCollectionController = function (view) {
    var context = this;
    context.view = view;

    context.mintEvent = "Mint(uint256,address,uint256)";

    context.loadData = async function loadData(view) {
        view.props.showItemsCount && context.loadItemsCount(view);
    };

    context.loadItemsCount = async function loadItemsCount(view) {
        var logs = await window.getLogs({
            address : view.props.collection.address,
            topics : [window.web3.utils.sha3(context.mintEvent)]
        });
        var collectionObjectIds = {};
        for(var log of logs) {
            var objectId = web3.eth.abi.decodeParameters(["uint256","address","uint256"], log.data)[0];
            collectionObjectIds[objectId] = true;
        }
        view.setState({itemsCount : (collectionObjectIds = Object.keys(collectionObjectIds)).length});
        view.props.onCollectionObjectIds && view.props.onCollectionObjectIds(collectionObjectIds);
    };
};