var Explore = React.createClass({
    getDefaultSubscriptions() {
        return {
            "collection/search": this.controller.onCollectionSearch
        }
    },
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx',
        "spa/lazyImageLoader.jsx",
        'spa/fullLoader.jsx'
    ],
    requiredModules: [
        'spa/singleCollection'
    ],
    onClick(e) {
        window.preventItem(e);
        var key = e.currentTarget.dataset.key;
        var collection;
        if(key !== undefined && key !== null) {
            collection = this.props.collections.filter(it => it.key === key)[0];
        }
        this.emit('section/change', 'spa/collection', { collection });
    },
    componentDidMount() {
        window.setHomepageLink(`?section=explore`);
    },
    getCollections() {
        var state = window.getState(this);
        var allCollections = state.collections.filter(it => it.category === 'W20');
        var collections = state.collections.filter(it => it.category !== 'W20');
        if(window.context.W1155GroupMode === true) {
            var sub = collections.filter(it => it.category === 'W1155');
            sub.forEach(it => collections.splice(collections.indexOf(it), 1));
            var subs = {};
            for(var collection of sub) {
                (subs[collection.sourceAddress] = (subs[collection.sourceAddress] || [])).push(collection);
            }
            Object.values(subs).forEach(it => collections.unshift(it[0]));
        }
        allCollections.push(... collections);
        allCollections = allCollections.filter(it => window.context.pandorasBox.indexOf(it.address) === -1 && (!it.sourceAddress || window.context.pandorasBox.indexOf(it.sourceAddress) === -1));
        return allCollections;
    },
    render() {
        var _this = this;
        var state = window.getState(this);
        if(state.loadingCollections) {
            return (<FullLoader/>);
        }
        return (<section className="Pager">
            <section className="collections">
                <section className="collectionsList">
                    {state.searchedCollection && <SingleCollection collection={state.searchedCollection} collectionKey={state.searchedCollection.key} onClick={_this.onClick} miniature/>}
                    {!state.searchedCollection && state.collections && this.getCollections().map(it => <SingleCollection collection={it} collectionKey={it.key} key={it.key} onClick={_this.onClick} miniature/>)}
                </section>
            </section>
        </section>);
    }
});