var SingleCollectionController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData(view) {
        view.props.showItemsCount && context.loadItemsCount(view);
    };

    context.loadItemsCount = async function loadItemsCount(view) {
        var collectionObjectIds = await window.loadCollectionItems(view.props.collection.address);
        view.setState({itemsCount : collectionObjectIds.filter(it => window.context.pandorasBox.indexOf(it.address) === -1).length});
        view.props.onCollectionObjectIds && view.props.onCollectionObjectIds(collectionObjectIds);
    };
};