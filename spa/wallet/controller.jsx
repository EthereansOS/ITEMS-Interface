var WalletController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        try {
            var promises = [];
            for (var collection of view.props.collections) {
                collection.items = collection.items || {};
                var collectionObjectIds = await window.loadCollectionItems(collection.address);
                for (var objectId of collectionObjectIds) {
                    promises.push(window.loadItemData(collection[objectId] = collection[objectId] || {
                        objectId,
                        collection
                    }, collection, context.view));
                }
            }
            await Promise.all(promises);
            context.view.setState({ loaded: true });
        } catch (e) {
        }
    };
};