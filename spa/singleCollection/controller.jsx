var SingleCollectionController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData(view) {
        view.props.showItemsCount && context.loadItemsCount(view);
    };

    context.loadItemsCount = async function loadItemsCount(view) {
        var collectionObjectIds = await window.loadCollectionItems(view.props.collection.address);
        view.setState({itemsCount : collectionObjectIds.length});
        view.props.onCollectionObjectIds && view.props.onCollectionObjectIds(collectionObjectIds);
    };
};