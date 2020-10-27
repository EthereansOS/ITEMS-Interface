var Item = React.createClass({
    requiredScripts : [
        "spa/lazyImageLoader.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => window.loadItemData(this),
            "ethereum/ping" : () => window.updateItemDynamicData(this)
        }
    },
    render() {
        var item = (this.state && this.state.item) || this.props.item;
        return (
            <section className="Pager">
                <section className="itemPage">
                    <section className="itemPageInfo">
                        <figure className="itemIcon">
                            <LazyImageLoader src={item.image}/>
                        </figure>
                        <article className="itemInfo">
                            <h3 className="ItemTitle" className="BrandizedS">{item.name}</h3>
                            <section className="itemaddress">
                                <h5 className="itemaddressnft">NFT: <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)}>{window.shortenWord(item.objectId, 9)}</a></h5>
                                <h5 className="itemaddress20">ERC20: <a target="_blank" href={`${window.getNetworkElement("etherscanURL")}address/${item.address}`}>{window.shortenWord(item.address, 10)}</a></h5>
                            </section>
                            <p className="itemDesc">{window.shortenWord(item.description, 100)}</p>
                            <a className="ItemCollectionLink" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(this.props.collection.openSeaName)}>Collection: {this.props.collection.symbol}</a>
                            <a className="ItemCollectionLink">Link: wimd.item.eth.link</a>
                            <section className="itemSide">
                                <span className="ItemSupply">Quantity: {window.fromDecimals(item.dynamicData.totalSupply, item.decimals)}</span>
                                {window.walletAddress && item.dynamicData && item.dynamicData.balanceOf && item.dynamicData.balanceOf !== '0' && <span className="ItemBalance">Balance: {window.fromDecimals(item.dynamicData.balanceOf, item.decimals)}</span>}
                                <span className="ItemPrice">&#129412; ${window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap)} <a target="_blank" href={window.context.uniswapSpawUrlTemplate.format(item.address)}>Swap</a><a target="_blank" href={window.context.uniswapInfoUrlTemplate.format(item.address)}>Info</a></span>
                                <span className="ItemPrice">&#9973; ${window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea)} <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)}>Info</a></span>
                            </section>
                        </article>
                    </section>
                    <section className="ItemStuff">
                        <section className="ItemFarm">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">FARM</h4>
                            </section>
                        </section>
                        <section className="ItemArbitrate">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">ARBITRAGE</h4>
                            </section>
                        </section>
                        <section className="ItemData">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">METADATA</h4>
                            </section>
                            <ul>
                                <li>
                                    <h6></h6>
                                </li>
                            </ul>
                        </section>
                        <section className="ItemCode">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">CODE</h4>
                            </section>
                        </section>
                    </section>
                </section>
            </section>);
    }
});