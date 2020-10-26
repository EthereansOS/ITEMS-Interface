var Item = React.createClass({
    render() {
        return (
            <section className="Pager">
                <section className="itemPage">
                    <section className="itemPageInfo">
                        <figure className="itemIcon">
                            <img src={this.props.item.image}/>
                        </figure>
                        <article className="itemInfo">
                            <h3 className="ItemTitle" className="BrandizedS">{this.props.item.name}</h3>
                            <section className="itemaddress">
                                <h5 className="itemaddressnft">NFT: <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.item.collection.address, this.props.item.objectId)}>{window.shortenWord(this.props.item.objectId, 9)}</a></h5>
                                <h5 className="itemaddress20">ERC20: <a target="_blank" href={`${window.getNetworkElement("etherscanURL")}address/${this.props.item.address}`}>{window.shortenWord(this.props.item.address, 10)}</a></h5>
                            </section>
                            <p className="itemDesc">{window.shortenWord(this.props.item.description, 100)}</p>
                            <a className="ItemCollectionLink" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(this.props.item.collection.openSeaName)}>Collection: {this.props.item.collection.symbol}</a>
                            <a className="ItemCollectionLink">Link: wimd.item.eth.link</a>
                            <section className="itemSide">
                                <span className="ItemSupply">Quantity: {window.fromDecimals(this.props.item.dynamicData.totalSupply, this.props.item.decimals)}</span>
                                {window.walletData && <span className="ItemBalance">Balance: {window.fromDecimals(this.props.item.dynamicData.balanceOf, this.props.item.decimals)}</span>}
                                <span className="ItemPrice">&#129412; ${window.formatMoney(this.props.item.dynamicData.tokenPriceInDollarsOnUniswap)} <a target="_blank" href={window.context.uniswapSpawUrlTemplate.format(this.props.item.address)}>Swap</a><a target="_blank" href={window.context.uniswapInfoUrlTemplate.format(this.props.item.address)}>Info</a></span>
                                <span className="ItemPrice">&#9973; ${window.formatMoney(this.props.item.dynamicData.tokenPriceInDollarsOnOpenSea)} <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.item.collection.address, this.props.item.objectId)}>Info</a></span>
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