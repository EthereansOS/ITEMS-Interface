var Wrap = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "ethereum/ping" : this.controller.refreshData
        }
    },
    getSelectedTokenType() {
        return (this.state && this.state.selectedTokenType) || window.context.supportedWrappedTokens[0];
    },
    reloadToken(e) {
        window.preventItem(e);
        this.controller.onTokenAddressChange(this.getSelectedTokenType(), this.tokenAddressInput.value);
    },
    onTokenTypeChange(e) {
        window.preventItem(e);
        var _this = this;
        this.setState({
            selectedTokenType: e.currentTarget.value,
        }, function() {
            _this.controller.onTokenAddressChange(_this.getSelectedTokenType(), _this.tokenAddressInput && _this.tokenAddressInput.value);
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
        _this.setState({selectedToken : null}, () => _this.controller.onTokenAddressChange(_this.getSelectedTokenType(), value));
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
        this.controller.onTokenAddressChange(this.getSelectedTokenType(), this.tokenAddressInput && this.tokenAddressInput.value);
        window.setHomepageLink(`?section=wrap`);
    },
    render() {
        var selectedTokenType = this.getSelectedTokenType();
        var state = this.state || {};
        return (<section className="Pager">
            <section className="wrapPage">
                <section className="wrapBox">
                    <section className="WrapWhat">
                        <p>Wrap Tokens as Items</p>
                        <br></br>
                        <select onChange={this.onTokenTypeChange}>
                            {window.context.supportedWrappedTokens.map(it => <option key={it} selected={selectedTokenType === it} value={it}>{it}</option>)}
                        </select>
                        {selectedTokenType !== 'ETH' && <input ref={ref => this.tokenAddressInput = ref} className="addressWrapSelector" type="text" placeholder="Token address" data-action="onTokenAddressChange" onKeyUp={this.onChange} onChange={this.onChange}/>}
                        {selectedTokenType !== 'ETH' && <a className="LoadToITEM" href="javascript:;" onClick={this.reloadToken}>Load</a>}
                    </section>
                    <section className="WrapWhatLoaded">
                        {state.selectedToken && (state.selectedToken.name || state.selectedToken.symbol) && <h6 className="tokenSelectedToWrap">{window.shortenWord(state.selectedToken.name, 10)} {state.selectedToken.symbol && state.selectedToken.name ? ` (${window.shortenWord(state.selectedToken.symbol, 10)})` : window.shortenWord(state.selectedToken.symbol, 10)}</h6>}
                        {state.selectedToken && state.selectedToken.message && <p><b>Please pay attention: </b>{state.selectedToken.message}</p>}
                        {state.selectedToken && selectedTokenType !== 'ERC20' && selectedTokenType !== 'ETH' && <section className="tokenSelectedToWrapDecide">
                            <input className="BalancetoWrapSelector" placeholder="Token ID" type="text" data-action="onTokenIdChange" onKeyUp={this.onChange} onChange={this.onChange}/>
                        </section>}
                        {state.selectedToken && selectedTokenType !== 'ERC721' && state.selectedToken && state.selectedToken.balanceOfPlain && <span className="tokenSelectedToWrapBalance">balance: {state.selectedToken.balanceOfPlain}</span>}
                        {state.selectedToken && selectedTokenType !== 'ERC721' && <section className="tokenSelectedToWrapDecide">
                            <a className="tokenSelectedToWrapBalanceALL" onClick={this.max}>MAX</a>
                            <input ref={ref => this.tokenAmountInput = ref} className="BalancetoWrapSelector" placeholder="Ammount" type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-action="onTokenAmountChange" onKeyUp={this.onChange} onChange={this.onChange} />
                        </section>}
                        {selectedTokenType === 'ERC20' && state.performing !== 'approve' && <a className={"BeforeToWrapToITEM" + (!state.selectedToken || state.selectedToken.approved ? " disabled" : "")} data-action="approve" onClick={window.perform} href="javascript:;">Approve</a>}
                        {selectedTokenType === 'ERC20' && state.performing === 'approve' && <InnerLoader/>}
                        {state.performing !== 'itemize' && <a className={"WrapToITEM" + (!state.selectedToken || !state.selectedToken.approved ? " disabled" : "")} data-action="itemize" onClick={window.perform} href="javascript:;">ITEMIZE</a>}
                        {state.performing === 'itemize' && <InnerLoader/>}
                    </section>
                </section>
            </section>
        </section>);
    }
});