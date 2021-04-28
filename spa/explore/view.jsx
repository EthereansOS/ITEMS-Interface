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
    getCollections(categories) {
        var state = window.getState(this);
        var allCollections = [];
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
        allCollections.push(... state.collections.filter(it => it.category === 'W20'));
        allCollections = allCollections.filter(it => window.context.pandorasBox.indexOf(it.address) === -1 && (!it.sourceAddress || window.context.pandorasBox.indexOf(it.sourceAddress) === -1));
        categories = !categories ? categories : (categories instanceof Array ? categories : [categories]).map(it => it.split('Wrapped ERC').join('W'));
        return !categories ? allCollections : allCollections.filter(it => it.symbol === 'cFARM' ? categories.indexOf("Covenants Farming Contracts") !== -1 : categories.indexOf(it.category) !== -1);
    },
    getCategories() {
        var categories = Object.values(window.context.ethItemFactoryEvents);
        categories = categories.filter((item, pos) => categories.indexOf(item) === pos).map(it => it.split('ABI').join('').split('W').join('Wrapped ERC'));
        categories.push("Covenants Farming Contracts");
        return categories;
    },
    onCategoryChange(e) {
        var categories = [];
        $(this.categories).children().find('input[type="checkbox"]:checked').each((_, element) => categories.push(element.dataset.key));
        if(categories.length === 0) {
            return window.preventItem(e);
        }
        window.localStorage.setItem('explore/categories', JSON.stringify(categories));
        this.forceUpdate();
    },
    render() {
        var _this = this;
        var state = window.getState(this);
        var categories = this.getCategories();
        try {
            categories = JSON.parse(window.localStorage.getItem('explore/categories')) || categories;
        } catch(e) {
        }
        if(state.loadingCollections) {
            return (<FullLoader/>);
        }
        return (<section className="Pager">
            <section className="collections">
                <section ref={ref => this.categories = ref}>
                    {this.getCategories().map(it => <label key={it}>
                        <p>{it}</p>
                        <input type="checkbox" checked={categories.indexOf(it) !== -1} data-key={it} onChange={this.onCategoryChange}/>
                    </label>)}
                </section>
                <section className="collectionsList">
                    {state.searchedCollection && <SingleCollection collection={state.searchedCollection} collectionKey={state.searchedCollection.key} onClick={_this.onClick} miniature/>}
                    {!state.searchedCollection && state.collections && this.getCollections(categories).map(it => <SingleCollection collection={it} collectionKey={it.key} key={it.key} onClick={_this.onClick} miniature/>)}
                </section>
            </section>
        </section>);
    }
});