var Item = React.createClass({
    requiredScripts: [
        "spa/lazyImageLoader.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => window.loadItemData(this),
            "ethereum/ping": () => window.updateItemDynamicData(this)
        }
    },
    onClick(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/collection', {
            collection: this.props.collection
        });
    },
    renderMetadata(renderShowButton) {
        var item = (this.state && this.state.item) || this.props.item;
        var keys = Object.keys(item.metadata);
        keys = renderShowButton ? keys.filter(it => window.context.allowedMetadataFields.indexOf(it) === -1) : keys.filter(it => window.context.allowedMetadataFields.indexOf(it) !== -1);
        var data = {};
        keys.forEach(it => data[it] = item.metadata[it]);
        return this.renderMetadataObject(data, false, renderShowButton);
    },
    renderMetadataValue(data, renderShowButton) {
        if (data instanceof Array) {
            return this.renderMetadataArray(data, renderShowButton);
        }
        if ((typeof data).toLowerCase() === 'object') {
            return this.renderMetadataObject(data, renderShowButton);
        }
        var result = (<section>{data}</section>);
        if((typeof data).toLowerCase() === "string" && data.length > 30) {
            result = (<p>{data}</p>);
        }
        if((typeof data).toLowerCase() === "string" && (data.toLowerCase().indexOf("http") === 0 || data.toLowerCase().indexOf("ipfs") === 0 || data.indexOf("//") === 0)) {
            result = (<a href={window.formatLink(data)} target="_blank">{window.shortenWord(data, 30)}</a>);
        }
        return renderShowButton ? this.renderShowButton(result) : result;
    },
    renderMetadataObject(data, renderShowButton, renderShowButtonForChildrens) {
        var result = (<ul>
            {Object.entries(data).map(it => <li key={it[0]}>
                <section>{renderShowButton || renderShowButtonForChildrens ? it[0] : window.normalizeName(it[0])}</section>
                {this.renderMetadataValue(it[1], renderShowButton || renderShowButtonForChildrens)}
            </li>)}
        </ul>);
        return renderShowButton ? this.renderShowButton(result) : result;
    },
    renderMetadataArray(array, renderShowButton) {
        var result = (<ol>
            {array.map((it, i) => <li key={i}>
                {this.renderMetadataValue(it, renderShowButton)}
            </li>)}
        </ol>);
        return renderShowButton ? this.renderShowButton(result) : renderShowButton;
    },
    renderShowButton(result) {
        var content;
        result.props = result.props || {};
        result.props.style = result.props.style || {};
        result.props.style.display = "none";
        result.ref = ref => content = ref;
        var onClick = function onClick(e) {
            window.preventItem(e);
            e.currentTarget.innerHTML = e.currentTarget.innerHTML === 'Show' ? 'Hide' : 'Show';
            content.style.display = e.currentTarget.innerHTML === 'Show' ? 'none' : 'inline-block';
        };
        return (<section>
            <a href="javascript:;" onClick={onClick}>
                Show
            </a>
            {result}
        </section>);
    },
    render() {
        var item = (this.state && this.state.item) || this.props.item;
        return (
            <section className="Pager">
                <section className="returntocollection">
                    <a href="javascript:;" onClick={this.onClick}><img src={this.props.collection.image}></img> &#8592; From the <b>{this.props.collection.name} <span>({this.props.collection.symbol})</span></b> collection</a>
                </section>
                <section className="itemPage">
                    <section className="itemPageInfo">
                        <figure className="itemIcon">
                            <LazyImageLoader src={item.image} />
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
                                <span className="ItemPrice">&#129412; $ {item.dynamicData.tokenPriceInDollarsOnUniswap ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap, 1) : "--"} <a target="_blank" href={window.context.uniswapSpawUrlTemplate.format(item.address)}>Swap</a><a target="_blank" href={window.context.uniswapInfoUrlTemplate.format(item.address)}>Info</a></span>
                                <span className="ItemPrice">&#9973; $ {item.dynamicData.tokenPriceInDollarsOnOpenSea ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea, 1) : "--"} <a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)}>Info</a></span>
                            </section>
                        </article>
                    </section>
                    <section className="ItemStuff">
                        <section className="ItemFarm">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">FARM</h4>
                                Soon @UniFi
                            </section>
                        </section>
                        <section className="ItemArbitrate">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">ARBITRAGE</h4>
                                Soon @UniFi
                            </section>
                        </section>
                        {item.metadata && <section className="ItemData">
                            <section className="ItemStuffOpen">
                                <h4 className="BrandizedS">METADATA</h4>
                            </section>
                            {this.renderMetadata()}
                            {this.renderMetadata(true)}
                        </section>}
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