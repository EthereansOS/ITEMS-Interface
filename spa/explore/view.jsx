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
        'spa/singleCollection',
        'spa/collection'
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
        this.setState({categories : [e.currentTarget.dataset.key], showW20 : e.currentTarget.dataset.key === 'Wrapped 20'});
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
                    {categories[0] === 'Native' &&  "Native ITEMs are collections of objects on top of Ethereum built as ITEMs natively. The ITEM Standard makes these objects interoperable across all of the Ethereum Network using both the ERC20 Interface and the ERC1155 Interface. Native ITEMs can also perform complex behaviors specified optionally via their Extension. These extra capabilities are up to the developers writing the Extension logic. For more Info, read the ITEM Documentation."}
                    {categories[0] === 'Wrapped 20' &&  "Wrapped ERC20 ITEMs are ERC20 Tokens Wrapped into the ITEM Standard. Wrapped ERC20, retain all the capabilities of the default ITEM standard, but lose any extra ones while wrapped. For example, once wrapped, A DAO or DFO governance token cannot interact with the DAO or DFO (until unwrapped, if not explicitly programmed) but can still be used like any ITEM using a gas-efficient method like BatchTransfer."}
                    {categories[0] === 'Wrapped 1155' &&  "Wrapped ERC1155 ITEMs are ERC1155 NFTs Wrapped into the ITEM Standard. Wrapped ERC1155, retain all the capabilities of the default ITEM standard, but lose any extra ones while wrapped. For example, once wrapped, The NFT can't be used in a specific Game, if any until unwrapped (if not explicitly programmed in the application), but can still be used like any ITEM as an interoperable Object in every DeFi application via its Interoperable Interface (ERC20)."}
                    {categories[0] === 'Wrapped 721' &&  "Wrapped ERC721 ITEMs are ERC721 NFTs Wrapped into the ITEM Standard. Wrapped ERC721, retain all the capabilities of the default ITEM standard, but lose any extra ones while wrapped. For example, once wrapped, The NFT can't be used in a specific Game, if any until unwrapped (if not explicitly programmed in the application), but can still be used like any ITEM as an interoperable Object in every DeFi application via its Interoperable Interface (ERC20)."}
                    {categories[0] === 'fLPs' &&  "Covenants Farming LP Tokens Collection are Native ITEMs minted for Locked Setups. The Liquidity Pool stored in Locked Setups remains liquid to the owner via the fLP token. These tokens correspond 1:1 with the quantity of LP tokens locked and can be redeemed anytime after the end block of a Locked Farming Setup."}
                    </p>
                </section>
                {!state.showW20 && <section className="collectionsList">
                    {state.searchedCollection && <SingleCollection collection={state.searchedCollection} collectionKey={state.searchedCollection.key} onClick={_this.onClick} miniature/>}
                    {!state.searchedCollection && state.collections && this.getCollections(categories).map(it => <SingleCollection collection={it} collectionKey={it.key} key={it.key} onClick={_this.onClick} miniature/>)}
                </section>}
            </section>
            {state.showW20 && <>
                <Collection collection={this.props.collections.filter(it => it.category === 'W20').reverse()[0]}/>
                <div className="OLDVER">
                    <h4>Old Versions:</h4>
                </div>
                {this.props.collections.filter(it => it.category === 'W20').reverse().map((it, i) => i !== 0 && <Collection key={it.address} collection={it}/>)}
            </>}
        </section>);
    }
});