var ExploreController = function (view) {
    var context = this;
    context.view = view;

    context.onCollectionSearch = async function onCollectionSearch(address) {
        if (!window.isEthereumAddress(address)) {
            return context.view.setState({ searchedCollection: null });
        }
        address = window.web3.utils.toChecksumAddress(address);
        var searchedCollection;
        try {
            searchedCollection = context.view.props.collections.filter(it => it.address === address)[0];
        } catch (e) {
        }
        if(!searchedCollection) {
            searchedCollection = await window.loadSingleCollection(address);
        }
        context.view.setState({searchedCollection});
    }
};