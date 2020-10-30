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
        var result = (<section className="subMetaValue">{data}</section>);
        if((typeof data).toLowerCase() === "string" && data.length > 30) {
            result = (<p className="subMetaValueString">{data}</p>);
        }
        if((typeof data).toLowerCase() === "string" && (data.toLowerCase().indexOf("http") === 0 || data.toLowerCase().indexOf("ipfs") === 0 || data.indexOf("//") === 0)) {
            result = (<a className="subMetaValueLink" href={window.formatLink(data)} target="_blank">{window.shortenWord(data, 30)}</a>);
        }
        return renderShowButton ? this.renderShowButton(result) : result;
    },
    renderMetadataObject(data, renderShowButton, renderShowButtonForChildrens) {
        var result = (
            Object.entries(data).map(it => <section className="subMetaValueList" key={it[0]}>
                <section className="subMetaValueOpen">{renderShowButton || renderShowButtonForChildrens ? it[0] : window.normalizeName(it[0])}</section>
                {this.renderMetadataValue(it[1], renderShowButton || renderShowButtonForChildrens)}
            </section>)
        );
        return renderShowButton ? this.renderShowButton(result) : result;
    },
    renderMetadataArray(array, renderShowButton) {
        var result = (<ul className="subMetaValueArrayList">
            {array.map((it, i) => <li key={i}>
                {this.renderMetadataValue(it, renderShowButton)}
            </li>)}
        </ul>);
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
            <a className="swowThis" href="javascript:;" onClick={onClick}>
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
                            <section className="itemFundamentals">
                                <h3 className="ItemTitle">{item.name} <span> ({this.props.collection.symbol})</span></h3>
                                <section className="itemFundamentalsThing">
                                    <h5 className="itemaddress"><a target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)}>NFT Address</a></h5>
                                    <h5 className="itemaddress"><a target="_blank" href={`${window.getNetworkElement("etherscanURL")}address/${item.address}`}>ERC20 Address</a></h5>
                                </section>
                                <span className="ItemCollectionLink">wimd.item.eth.link</span>
                                <section className="itemFundamentalsThing">
                                    <span className="ItemSupply">Supply: {window.fromDecimals(item.dynamicData.totalSupply, item.decimals)} </span>
                                    {window.walletAddress && item.dynamicData && item.dynamicData.balanceOf && item.dynamicData.balanceOf !== '0' && <span className="ItemBalance">| You own: {window.fromDecimals(item.dynamicData.balanceOf, item.decimals)}</span>}
                                </section>
                            </section>
                            <p className="itemDesc">{window.shortenWord(item.description, 1000)}</p>
                            <section className="itemSide">
                                <a className="ItemPrice" target="_blank" href={window.context.uniswapSpawUrlTemplate.format(item.address)}>&#129412; $ {item.dynamicData.tokenPriceInDollarsOnUniswap ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap, 1) : "--"}</a>
                                <a className="ItemPrice" target="_blank" href={window.context.uniswapInfoUrlTemplate.format(item.address)}>&#128039; Info</a>
                                <a className="ItemPrice" target="_blank" href={window.context.openSeaItemLinkTemplate.format(this.props.collection.address, item.objectId)}>&#9973; $ {item.dynamicData.tokenPriceInDollarsOnOpenSea ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea, 1) : "--"}</a>
                            </section>
                        </article>
                    </section>
                    <section className="collectionNav">
                    <ul>
                        <li>
                            <a>METADATA</a>
                        </li>
                        <li>
                            <a>CODE</a>
                        </li>
                        <li>
                            <a>FARM</a>
                        </li>
                        <li>
                            <a>ARBITRAGE</a>
                        </li>
                    </ul>
                    </section>
                    <section className="ItemStuff">
                        <section className="ItemFarm">
                            Soon @UniFi
                        </section>
                        <section className="ItemArbitrate">
                            Soon @UniFi
                        </section>
                        {item.metadata && <section className="ItemData">
                            <section className="ItemStuffOpen">
                            </section>
                            {this.renderMetadata()}
                            {this.renderMetadata(true)}
                        </section>}
                        <section className="ItemCode">
                            
                        </section>
                    </section>
                </section>
            </section>);
    }
});