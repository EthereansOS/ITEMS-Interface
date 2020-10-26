var CollectionSingleItem = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => this.controller.loadData(this)
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
        this.controller.loadData(this);
    },
    render() {
        return (<section className="collectionPageItem">
            <a href={this.props.readOnly ? undefined : "javascript:;"} onClick={this.props.readOnly ? undefined : this.onClick}>
                <figure className="ItemIcon">
                    <img src={this.state && this.state.item.image} />
                </figure>
            </a>
            <article className="ItemInfo">
                <h3 className="ItemTitle" className="BrandizedS">{this.state && this.state.item && this.state.item.name}</h3>
                {this.state && this.state.item && this.state.item.dynamicData && this.state.item.dynamicData.tokenPriceInDollarsOnUniswap !== 0 && <a className="ItemPrice">&#129412; Price: ${window.formatMoney(this.state.item.dynamicData.tokenPriceInDollarsOnUniswap)}</a>}
                {this.state && this.state.item && this.state.item.dynamicData && this.state.item.dynamicData.tokenPriceInDollarsOnOpenSea !== 0 && <a className="ItemPrice">&#9973; Price: ${window.formatMoney(this.state.item.dynamicData.tokenPriceInDollarsOnOpenSea)}</a>}
                {this.state && this.state.item && this.state.item.dynamicData && this.state.item.dynamicData.totalSupply && <span className="ItemSupply">Quantity: {window.fromDecimals(this.state.item.dynamicData.totalSupply, this.state.item.decimals)}</span>}
                <a className="ItemCollectionLink" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(this.props.collection.openSeaName)}>Collection: {this.props.collection.symbol}</a>
            </article>
        </section>);
    }
});