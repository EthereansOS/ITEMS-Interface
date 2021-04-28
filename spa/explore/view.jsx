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
        categories = !categories ? categories : (categories instanceof Array ? categories : [categories]).map(it => it.split('Wrapped ').join('W'));
        return !categories ? allCollections : allCollections.filter(it => it.symbol === 'cFARM' ? categories.indexOf("fLPs") !== -1 : categories.indexOf(it.category) !== -1);
    },
    getCategories() {
        var categories = Object.values(window.context.ethItemFactoryEvents);
        categories = categories.filter((item, pos) => categories.indexOf(item) === pos).map(it => it.split('ABI').join('').split('W').join('Wrapped '));
        categories.push("fLPs");
        return categories;
    },
    onCategoryChange(e) {
        window.preventItem(e);
        this.setState({categories : [e.currentTarget.dataset.key]});
    },
    render() {
        var _this = this;
        var state = window.getState(this);
        var categories = state.categories || [this.getCategories()[0]];
        if(state.loadingCollections) {
            return (<FullLoader/>);
        }
        return (<section className="Pager">
            <section className="collections">
                <section className="CategoriesList">
                    {this.getCategories().map(it => <a key={it} href="javascript:;" className={"Category" + (categories.indexOf(it) !== -1 ? " Selected" : "")} data-key={it} onClick={this.onCategoryChange}>{it}</a>)}
                </section>
                <section className="ExploreSelectionDescription">
                    <p>
                    {categories[0] === 'Native' &&  "Native ITEMs are Ethereum Objects that are created as ITEMs nativelly. "}
                    {categories[0] === 'W20' &&  "Testo W20"}
                    {categories[0] === 'W1155' &&  "Testo W1155"}
                    {categories[0] === 'W721' &&  "Testo W721"}
                    {categories[0] === 'Covenants' &&  "Testo Covenats"}
                    </p>
                </section>
                <section className="collectionsList">
                    {state.searchedCollection && <SingleCollection collection={state.searchedCollection} collectionKey={state.searchedCollection.key} onClick={_this.onClick} miniature/>}
                    {!state.searchedCollection && state.collections && this.getCollections(categories).map(it => <SingleCollection collection={it} collectionKey={it.key} key={it.key} onClick={_this.onClick} miniature/>)}
                </section>
            </section>
        </section>);
    }
});