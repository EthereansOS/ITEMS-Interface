var Wrap = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx',
        'spa/loader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "ethereum/ping": this.controller.refreshData,
            "collections/refreshed": () => this.forceUpdate()
        }
    },
    toggleMore(e) {
        window.preventItem(e);
        this.setState({ more: !window.getState(this).more });
    },
    getOwnedList() {
        var state = window.getState(this);
        var selectedTokenType = this.getSelectedTokenType().split('ERC').join('W');
        return (state && state.collections && state.collections.filter(it => it.category === selectedTokenType)) || undefined;
    },
    getSelectedTokenType() {
        return (this.state && this.state.selectedTokenType) || window.context.supportedWrappedTokens[0];
    },
    reloadToken(e) {
        window.preventItem(e);
        this.controller.onTokenAddressChange(this.getSelectedTokenType());
    },
    onTokenTypeChange(e) {
        window.preventItem(e);
        var _this = this;
        this.setState({
            selectedTokenType: e.currentTarget.value,
            selectedCollection: null
        }, function () {
            _this.tokenIdInput && _this.onTokenIdChange(_this.tokenIdInput.value = '');
            _this.controller.onTokenAddressChange(_this.getSelectedTokenType());
        });
    },
    onChange(e) {
        window.preventItem(e);
        var value = e.currentTarget.value;
        var callback = this[e.currentTarget.dataset.action];
        var timeVar = e.currentTarget.dataset.action + "Timeout";
        this[timeVar] && window.clearTimeout(this[timeVar]);
        this[timeVar] = setTimeout(() => callback(value), window.context.inputTimeout);
    },
    onTokenAddressChange(value) {
        var _this = this;
        _this.setState({ selectedToken: null }, () => _this.controller.onTokenAddressChange(_this.getSelectedTokenType(), value));
    },
    onTokenIdChange(value) {
        if (!this.state || !this.state.selectedToken) {
            return;
        }
        this.state.selectedToken.tokenId = value;
        this.controller.refreshBalanceOf();
    },
    onTokenAmountChange(value) {
        if (!this.state || !this.state.selectedToken) {
            return;
        }
        this.state.selectedToken.tokenAmount = value;
    },
    max(e) {
        window.preventItem(e);
        if (!this.state || !this.state.selectedToken || !this.state.selectedToken.balanceOfPlain) {
            return;
        }
        this.tokenAmountInput.value = this.state.selectedToken.tokenAmount = this.state.selectedToken.balanceOfPlain.split(",").join("");
        this.setState({ selectedToken: this.state.selectedToken });
    },
    actionEnd() {
        this.controller.refreshData()
    },
    componentDidMount() {
        var _this = this;
        _this.setState({ selectedTokenType: _this.props.selectedTokenType || _this.getSelectedTokenType(), selectedCollection: _this.props.collectionAddress ? _this.props.collections.filter(it => it.address === _this.props.collectionAddress)[0] : null }, () => {
            _this.controller.onTokenAddressChange(_this.state.selectedTokenType, _this.props.sourceAddress).then(() => {
                if (!_this.tokenIdInput || !_this.props.tokenId || (_this.state.selectedCollection && _this.state.selectedCollection.category === 'W721')) {
                    return;
                }
                _this.onTokenIdChange(_this.tokenIdInput.value = _this.props.tokenId);
            });
        });
        window.setHomepageLink(`?section=wrap`);
    },
    selectCollection(e) {
        window.preventItem(e);
        var _this = this;
        var selectedCollection = _this.props.collections.filter(it => it.address === e.currentTarget.dataset.address)[0];
        _this.setState({ selectedTokenType: selectedCollection.category.split("W").join('ERC'), selectedCollection, more: false }, () => {
            _this.controller.loadCollectionData();
            selectedCollection.sourceAddress && selectedCollection.sourceAddress !== 'blank' && _this.controller.onTokenAddressChange(_this.getSelectedTokenType(), selectedCollection.sourceAddress);
            _this.tokenIdInput && _this.onTokenIdChange(_this.tokenIdInput.value = "");
        });
    },
    selectCollectionItem(e) {
        window.preventItem(e);
        var _this = this;
        var selectedCollection = _this.state.selectedCollection;
        var selectedItem = selectedCollection.items[e.currentTarget.dataset.objectid];
        var address = selectedItem.sourceAddress && selectedItem.sourceAddress !== 'blank' ? selectedItem.sourceAddress : selectedCollection.sourceAddress;
        _this.controller.onTokenAddressChange(_this.getSelectedTokenType(), address).then(() => {
            if (!_this.tokenIdInput || !selectedItem.objectId) {
                return;
            }
            _this.onTokenIdChange(_this.tokenIdInput.value = selectedItem.objectId);
        });
    },
    render() {
        var selectedTokenType = this.getSelectedTokenType();
        var state = this.state || {};
        var list = this.getOwnedList();
        var sourceAddressFilter = it => (it.sourceAddress && it.sourceAddress !== 'blank' && it.sourceAddress !== window.voidEthereumAddress) || (state.selectedCollection.sourceAddress && state.selectedCollection.sourceAddress !== 'blank' && state.selectedCollection.sourceAddress !== window.voidEthereumAddress);
        return (<section className="Pager">
            <section className="wrapPage">
                <section className="wrapBox">
                    {(!list || list.length > 0) && <section>
                        <h3>Collections</h3>
                        {!list && <Loader />}
                        {list && list.length > 0 && <ul>
                            {list.map(it => <li key={it.address}>
                                <a href="javascript:;" data-address={it.address} onClick={this.selectCollection}>
                                    <h6 className="tokenSelectedToWrap">{window.shortenWord(it.name, 10)} {it.symbol && it.name ? ` (${window.shortenWord(it.symbol, 10)})` : window.shortenWord(it.symbol, 10)}</h6>
                                </a>
                            </li>)}
                        </ul>}
                    </section>}
                    {state.selectedCollection && state.selectedCollection.category !== 'W721' && <section>
                        <h3>Items</h3>
                        {(!state.selectedCollection.items || Object.keys(state.selectedCollection.items).length === 0) && <Loader />}
                        {state.selectedCollection.items && Object.keys(state.selectedCollection.items).length > 0 && <ul>
                            {Object.values(state.selectedCollection.items).filter(sourceAddressFilter).map(it => <li key={it.objectId}>
                                <a href="javascript:;" data-objectId={it.objectId} onClick={this.selectCollectionItem}>
                                    <h6 className="tokenSelectedToWrap">{window.shortenWord(it.sourceName, 10)} {it.sourceSymbol && it.sourceName ? ` (${window.shortenWord(it.sourceSymbol, 10)})` : window.shortenWord(it.sourceSymbol, 10)}</h6>
                                </a>
                            </li>)}
                        </ul>}
                    </section>}
                    <section className="WrapWhat">
                        <p>Wrap Tokens as Items</p>
                        <br />
                        <select onChange={this.onTokenTypeChange}>
                            {window.context.supportedWrappedTokens.map(it => <option key={it} selected={selectedTokenType === it} value={it}>{it}</option>)}
                        </select>
                        {selectedTokenType !== 'ETH' && <a href="javascript:;" className="MoreButton" onClick={this.toggleMore}>More</a>}
                        {state.more && selectedTokenType !== 'ETH' && <input ref={ref => (this.tokenAddressInput = ref) && (ref.value = (state.selectedToken && state.selectedToken.address) || '')} className="addressWrapSelector" type="text" placeholder="Token address" data-action="onTokenAddressChange" onKeyUp={this.onChange} onChange={this.onChange} />}
                        {state.more && selectedTokenType !== 'ETH' && <a className="LoadToITEM" href="javascript:;" onClick={this.reloadToken}>Load</a>}
                    </section>
                    <section className="WrapWhatLoaded">
                        {state.selectedToken && (state.selectedToken.name || state.selectedToken.symbol) && <h6 className="tokenSelectedToWrap">{window.shortenWord(state.selectedToken.name, 10)} {state.selectedToken.symbol && state.selectedToken.name ? ` (${window.shortenWord(state.selectedToken.symbol, 10)})` : window.shortenWord(state.selectedToken.symbol, 10)}</h6>}
                        {state.selectedToken && state.selectedToken.message && <p><b>Please pay attention: </b>{state.selectedToken.message}</p>}
                        {state.selectedToken && selectedTokenType !== 'ERC20' && selectedTokenType !== 'ETH' && <section className="tokenSelectedToWrapDecide">
                            <input ref={ref => this.tokenIdInput = ref} className="BalancetoWrapSelector" placeholder="Token ID" type="text" data-action="onTokenIdChange" onKeyUp={this.onChange} onChange={this.onChange} />
                        </section>}
                        {state.selectedToken && selectedTokenType !== 'ERC721' && state.selectedToken && state.selectedToken.balanceOfPlain && <span className="tokenSelectedToWrapBalance">balance: {state.selectedToken.balanceOfPlain}</span>}
                        {state.selectedToken && selectedTokenType !== 'ERC721' && <section className="tokenSelectedToWrapDecide">
                            <a className="tokenSelectedToWrapBalanceALL" onClick={this.max}>MAX</a>
                            <input ref={ref => this.tokenAmountInput = ref} className="BalancetoWrapSelector" placeholder="Ammount" type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-action="onTokenAmountChange" onKeyUp={this.onChange} onChange={this.onChange} />
                        </section>}
                        {selectedTokenType === 'ERC20' && state.performing !== 'approve' && <a className={"BeforeToWrapToITEM" + (!state.selectedToken || state.selectedToken.approved ? " disabled" : "")} data-action="approve" onClick={window.perform} href="javascript:;">Approve</a>}
                        {selectedTokenType === 'ERC20' && state.performing === 'approve' && <InnerLoader />}
                        {state.performing !== 'itemize' && <a className={"WrapToITEM" + (!state.selectedToken || !state.selectedToken.approved ? " disabled" : "")} data-action="itemize" onClick={window.perform} href="javascript:;">ITEMIZE</a>}
                        {state.performing === 'itemize' && <InnerLoader />}
                    </section>
                </section>
            </section>
        </section>);
    }
});