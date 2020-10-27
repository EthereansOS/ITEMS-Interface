var CollectionSingleItem = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx',
        "spa/lazyImageLoader.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => window.loadItemData(this),
            "ethereum/ping" : () => window.updateItemDynamicData(this)
        }
    },
    onClick(e) {
        window.preventItem(e);
        if (!this.state || !this.state.item) {
            return;
        }
        this.emit('section/change', 'spa/item', {
            collection: this.props.collection,
            item: this.state.item
        });
    },
    goToCollection(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/collection', {
            collection: this.props.collection
        });
    },
    componentDidMount() {
        window.loadItemData(this);
    },
    render() {
        var item = (this.state && this.state.item) || this.props.item;
        var color = item && item.backgroundImage;
        return (<section className="collectionPageItem">
            <a href={this.props.readOnly ? undefined : "javascript:;"} onClick={this.props.readOnly ? undefined : this.onClick}>
                <figure className="ItemIcon" style={{"background-color" : color}}>
                    {item && <LazyImageLoader src={this.state && item.image}/>}
                </figure>
            </a>
            {item && <article className="ItemInfo">
                <h3 className="ItemTitle" style={{color}}>{item.name}</h3>
                {item.dynamicData && <a target="_blank" href={window.context.uniswapSpawUrlTemplate.format(item.address)} className="ItemPrice">&#129412; $ {item.dynamicData.tokenPriceInDollarsOnUniswap ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap, 1) : "--"}</a>}
                {item.dynamicData && <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)} className="ItemPrice">&#9973; $ {item.dynamicData.tokenPriceInDollarsOnOpenSea ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea, 1) : "--"}</a>}
                {item.dynamicData && item.dynamicData.totalSupply && <span className="ItemSupply">Supply: <b>{window.fromDecimals(item.dynamicData.totalSupply, item.decimals)}</b></span>}
                {this.props.showCollection && <a className="ItemCollectionLink" href="javascript:;" onClick={this.goToCollection} >from <b>{this.props.collection.symbol}</b></a>}
            </article>}
        </section>);
    }
});