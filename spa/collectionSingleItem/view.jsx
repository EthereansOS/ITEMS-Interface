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
                {item.dynamicData && item.dynamicData.tokenPriceInDollarsOnUniswap !== 0 && <a className="ItemPrice">&#129412; ${window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap)}</a>}
                {item.dynamicData && item.dynamicData.tokenPriceInDollarsOnOpenSea !== 0 && <a className="ItemPrice">&#9973; ${window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea)}</a>}
                {item.dynamicData && item.dynamicData.totalSupply && <span className="ItemSupply">Supply: <b>{window.fromDecimals(item.dynamicData.totalSupply, item.decimals)}</b></span>}
                <a className="ItemCollectionLink" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(this.props.collection.openSeaName)}>from <b>{this.props.collection.symbol}</b></a>
            </article>}
        </section>);
    }
});