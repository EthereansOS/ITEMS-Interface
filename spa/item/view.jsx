var Item = React.createClass({
    requiredScripts: [
        "spa/lazyImageLoader.jsx",
        "spa/innerLoader.jsx",
        "spa/loader.jsx",
        "spa/farmComponents/farmViewer.jsx"
    ],
    requiredModules: [
        'spa/editor'
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => window.loadItemData(undefined, undefined, this),
            "ethereum/ping": () => window.updateItemDynamicData(undefined, this),
            "wallet/update": () => this.forceUpdate()
        }
    },
    onClick(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/collection', {
            collection: this.getItem().collection
        });
    },
    toggle(e) {
        window.preventItem(e);
        var oldToggle = this.state && this.state.toggle;
        var toggle = e.currentTarget.innerHTML.toLowerCase();
        toggle = oldToggle === toggle ? null : toggle;
        this.setState({ toggle });
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
            return this.renderMetadataObject(data);
        }
        var result = (<section className="subMetaValue">{data}</section>);
        if ((typeof data).toLowerCase() === "string" && data.length > 30) {
            result = (<p className="subMetaValueString" ref={ref => ref && (ref.innerHTML = window.convertTextWithLinksInHTML(data))}></p>);
        }
        if ((typeof data).toLowerCase() === "string" && (data.toLowerCase().indexOf("http") === 0 || data.toLowerCase().indexOf("ipfs") === 0 || data.indexOf("//") === 0)) {
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
                {this.renderMetadataValue(it)}
            </li>)}
        </ul>);
        return renderShowButton ? this.renderShowButton(result) : result;
    },
    renderShowButton(result) {
        var content;
        result.props = result.props || {};
        result.props.style = result.props.style || {};
        result.props.style.display = "none";
        var oldRef = result.ref;
        result.ref = ref => {
            content = ref;
            oldRef && oldRef(ref);
        };
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
    max(e) {
        window.preventItem(e);
        this.unwrapInput.value = this.getItem().dynamicData.balanceOfCollectionSidePlain.split(',').join();
    },
    componentDidMount() {
        var item = this.getItem();
        window.setHomepageLink(`?interoperable=${item.address}`);
        var _this = this;
        window.retrieveWrappedCode(item).then(() => _this.forceUpdate());
    },
    wrap(e) {
        window.preventItem(e);
        var item = this.getItem();
        this.emit('section/change', 'spa/wrap', {
            selectedTokenType: item.collection.category.split('W').join('ERC'),
            collectionAddress: item.collection.address,
            sourceAddress: item.sourceAddress && item.sourceAddress !== 'blank' ? item.sourceAddress : item.collection.sourceAddress,
            tokenId: item.objectId
        });
    },
    transfer(e) {
        window.preventItem(e);
        var item = this.getItem();
        this.emit('section/change', 'spa/transfer', {
            collectionAddress: item.collection.address,
            objectId: item.objectId
        });
    },
    getItem() {
        return (this.state && this.state.item) || this.props.item;
    },
    render() {
        var item = this.getItem();
        if (this.state && this.state.item && this.state.item.objectId !== this.props.item.objectId) {
            item = this.props.item;
        }
        var toggle = !this.state ? item.metadata ? 'metadata' : 'farm' : this.state.toggle;
        return (
            <section className="Pager">
                <section className="returntocollection">
                    <a href="javascript:;" onClick={this.onClick}><img src={window.getElementImage(item.collection)}></img> &#8592; From the <b>{item.collection.name} <span>({item.collection.symbol})</span></b> collection</a>
                </section>
                <section className="itemPage">
                    <section className="itemPageInfo">
                        <figure className="itemIcon">
                            <LazyImageLoader src={window.getElementImage(item)} />
                        </figure>
                        <article className="itemInfo">
                            <section className="itemFundamentals">
                                <h3 className="ItemTitle">{item.name} <span> ({item.symbol})</span></h3>
                                <section className="itemFundamentalsThing">
                                    <h5 className="itemaddress"><a target="_blank" href={`${window.getNetworkElement("etherscanURL")}address/${item.collection.address}/${item.objectId}`}>NFT Address</a></h5>
                                    <h5 className="itemaddress"><a target="_blank" href={`${window.getNetworkElement("etherscanURL")}token/${item.address}`}>ERC20 Address</a></h5>
                                </section>
                                <section className="collectionInfoSide">
                                    <span className="ItemCollectionLink"><a target="_blank" onClick={window.copyHREF} href={window.getHomepageLink(`?wrappedItem=${this.props.item.address}`)} className="collectionLink collectionLinkS BrandizedS superlink">Copy Link</a></span>
                                </section>
                                <section className="collectionInfoSideLinks">
                                    {item.collection.licence_url && <span className="ItemCollectionLink"><a target="_blank" href={window.formatLink(item.collection.licence_url)} className="collectionLink">Collection Licence</a></span>}
                                    {this.props.item.licence_url && <span className="ItemCollectionLink"><a target="_blank" href={window.formatLink(this.props.item.licence_url)} className="collectionLink">Item Licence</a></span>}
                                </section>
                                <section className="itemFundamentalsThing">
                                    {item.dynamicData && item.dynamicData.isEditable && item.collection.extensionAddress && item.collection.extensionAddress !== window.voidEthereumAddress && <span className="HostInfo">Host {item.collection.extensionIsContract ? "Contract" : "Wallet"}: <a target="_blank" href={`${window.getNetworkElement('etherscanURL')}address/${item.collection.extensionAddress}`}>{window.shortenWord(item.collection.extensionAddress, 6)}</a></span>}
                                    {((item.sourceAddress !== 'blank' && item.sourceAddress !== window.voidEthereumAddress) || item.collection.sourceAddress !== 'blank') && <span className="HostInfo">Wrapped from: <a target="_blank" href={`${window.getNetworkElement('etherscanURL')}address/${item.sourceAddress !== 'blank' ? item.sourceAddress : item.collection.sourceAddress}`}>{item.sourceAddress !== 'blank' ? item.sourceAddress : window.shortenWord(item.collection.sourceAddress, 6)}</a></span>}
                                    {item.dynamicData && <section className="itemSide">
                                        <span className="ItemSupply">Supply: {window.fromDecimals(item.dynamicData.totalSupply, item.decimals)}</span>
                                        {window.walletAddress && item.dynamicData && item.dynamicData.balanceOf && item.dynamicData.balanceOf !== '0' && <span className="ItemBalance">| You own: {window.formatMoney(window.fromDecimals(item.dynamicData.balanceOf, item.decimals, true), 2)}</span>}
                                        <br />
                                        <a className="ItemPrice" target="_blank" href={window.context.uniswapSpawUrlTemplate.format(item.address)}>&#129412; $ {item.dynamicData.tokenPriceInDollarsOnUniswap ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnUniswap, 1) : "--"}</a>
                                        <a className="ItemPrice" target="_blank" href={window.context.uniswapInfoUrlTemplate.format(item.address)}>&#128039; Info</a>
                                        <a className="ItemPrice" target="_blank" href={window.context.openSeaItemLinkTemplate.format(item.collection.address, item.objectId)}>&#9973; $ {item.dynamicData.tokenPriceInDollarsOnOpenSea ? window.formatMoney(item.dynamicData.tokenPriceInDollarsOnOpenSea, 1) : "--"}</a>
                                        <section className="itemSidebySide">
                                            {this.props.item.dynamicData && this.props.item.dynamicData.canMint && <section className="SettingsForOwn">
                                                <label>
                                                    <input type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" ref={ref => this.mintMoreInput = ref} />
                                                </label>
                                                {(!this.state || this.state.performing !== 'mint') && <a className={"" + (this.state && this.state.performing ? ' disabled' : '')} href="javascript:;" data-action="mint" onClick={window.perform}>Mint</a>}
                                                {this.state && this.state.performing === 'mint' && <InnerLoader />}
                                            </section>}
                                            <section className="SettingsForOwn">
                                                {this.props.item.collection.category !== 'Native' && this.props.item.dynamicData && this.props.item.dynamicData.balanceOf && this.props.item.dynamicData.balanceOf !== '0' && <a href="javascript:;" className="WrapButton" onClick={this.wrap}>Wrap</a>}
                                                {this.props.item.dynamicData && this.props.item.dynamicData.balanceOf && this.props.item.dynamicData.balanceOf !== '0' && <a href="javascript:;" className="WrapButton" onClick={this.transfer}>Transfer</a>}
                                            </section>
                                            {this.props.item.collection.category !== 'Native' && this.props.item.dynamicData && parseFloat(this.props.item.dynamicData.balanceOfCollectionSidePlain) > 0 && <section className="SettingsForOwn">
                                                <label>
                                                    <a className="MaximumBro" href="javascript:;" onClick={this.max}>Max</a>
                                                    <input type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" ref={ref => this.unwrapInput = ref} />
                                                </label>
                                                {(!this.state || this.state.performing !== "unwrap") && <a className={"" + (this.state && this.state.performing ? ' disabled' : '')} href="javascript:;" data-action="unwrap" onClick={window.perform}>Unwrap</a>}
                                                {this.state && this.state.performing === 'unwrap' && <InnerLoader />}
                                            </section>}
                                        </section>
                                    </section>}
                                </section>
                            </section>
                            {window.renderExpandibleElement(!item.description ? "No description available" : window.convertTextWithLinksInHTML(item.description), <p className="itemDesc" />)}
                            {item.metadataMessage && <p className="itemDesc" ref={ref => ref && (ref.innerHTML = item.metadataMessage)} />}
                        </article>
                    </section>
                    <section className="collectionNav">
                        <ul>
                            {item.metadata && <li className={toggle === 'metadata' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle}>METADATA</a></li>}
                            <li className={toggle === 'farm' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle}>FARM</a></li>
                            {(this.props.item.collection.extensionCode || this.props.item.collection.modelCode || this.props.item.collection.wrappedCode) && <li className={toggle === 'code' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle} data-toggle="code">CODE</a></li>}
                        </ul>
                    </section>
                    <section className="ItemStuff">
                        {toggle === 'metadata' && <section className="ItemData">
                            <section className="ItemStuffOpen">
                            </section>
                            {this.renderMetadata()}
                            {this.renderMetadata(true)}
                        </section>}
                        {toggle === 'code' && <section className="collectionPageItemsCode">
                            {this.props.item.collection.extensionCode && <section className="CodePART">
                                <h3>Extension <a target="_blank" href={window.getNetworkElement("etherscanURL") + "address/" + item.collection.address}> (Etherscan)</a></h3>
                                <Editor readonly firstCode={this.props.item.collection.extensionCode} />
                            </section>}
                            {this.props.item.collection.modelCode && <section className="CodePART">
                                <h3>Main Interface <a target="_blank" href={window.getNetworkElement("etherscanURL") + "address/" + item.collection.address}> (Etherscan)</a></h3>
                                <Editor readonly firstCode={this.props.item.collection.modelCode} />
                            </section>}
                            {this.props.item.collection.wrappedCode && <section className="CodePART">
                                <h3>Interoperable Interface <a target="_blank" href={window.getNetworkElement("etherscanURL") + "address/" + item.collection.address}> (Etherscan)</a></h3>
                                <Editor readonly firstCode={this.props.item.collection.wrappedCode} />
                            </section>}
                        </section>}
                        {toggle === 'farm' && <section className="ItemFarm">
                            <section>
                                <a href={window.context.createFarmingContractURLTemplate.format(item.address)} target="_blank">New Farming Contract</a>
                            </section>
                            <FarmViewer itemAddress={item.address} />
                        </section>}
                    </section>
                </section>
            </section>);
    }
});