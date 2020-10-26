var CollectionSingleItemController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData(view) {
        var propsItem = (view.props.collection.items && view.props.collection.items[view.props.objectId]) || {};
        var stateItem = (view.state && view.state.item) || {};
        var item = {};
        item = window.deepCopy(item, propsItem);
        item = window.deepCopy(item, stateItem);
        view.props.collection.items = view.props.collection.items || {};
        view.props.collection.items[view.props.objectId] = item;
        item.objectId = view.props.objectId;
        item.contract = view.props.collection.contract;
        item.collection = view.props.collection;
        item.address = item.address || window.web3.utils.toChecksumAddress(await window.blockchainCall(item.contract.methods.asERC20, item.objectId));
        item.token = item.token || window.newContract(window.context.IERC20ABI, item.address);
        item.name = item.name || await window.blockchainCall(item.contract.methods.name, item.objectId);
        item.symbol = item.symbol || await window.blockchainCall(item.contract.methods.symbol, item.objectId);
        await window.tryRetrieveMetadata(item);
        item.decimals = item.decimals || await window.blockchainCall(item.token.methods.decimals);
        view.setState({item}, () => context.updateDynamicData(view));
    };

    context.updateDynamicData = async function updateDynamicData(view) {
        var item = view.state.item;
        item.dynamicData = item.dynamicData || {};
        item.dynamicData.totalSupply = await window.blockchainCall(item.token.methods.totalSupply);
        item.dynamicData.tokenPriceInDollarsOnUniswap = await window.getTokenPriceInDollarsOnUniswap(item.address, item.decimals);
        item.dynamicData.tokenPriceInDollarsOnOpenSea = await window.getTokenPriceInDollarsOnOpenSea(item.collection.address, item.objectId);
        delete item.dynamicData.balanceOf;
        window.walletAddress && (item.dynamicData.balanceOf = await window.blockchainCall(item.token.methods.balanceOf, window.walletAddress));
        view.setState({item});
    };
};