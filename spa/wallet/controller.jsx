var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        for(var collection of view.props.collections) {
            collection.items = collection.items || {};
            var collectionObjectIds = await window.loadCollectionItems(collection.address);
            for(var objectId of collectionObjectIds) {
                await window.loadItemData(collection[objectId] = collection[objectId] || {
                    objectId,
                    collection
                }, collection, context.view);
            }
        }
        context.view.setState({loaded : true});
    };
};