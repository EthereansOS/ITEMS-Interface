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
        var collections = state.collections.filter(it => it.category === 'W20');
        collections.push(...state.collections.filter(it => it.category !== 'W20'));
        return collections;
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