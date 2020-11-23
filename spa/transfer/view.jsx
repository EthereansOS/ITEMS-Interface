var Transfer = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx',
        'spa/transfer/transferInput.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "ethereum/ping" : this.controller.refreshData
        }
    },
    onBatch(e) {
        var _this = this;
        _this.setState({batch : e.currentTarget.checked}, () => {
            if(!_this.state.batch) {
                var objectIds = (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it)) || [];
                objectIds[0] && (objectIds = [objectIds[0]]);
                _this.setState({objectIds});
            }
        });
    },
    reloadCollection(e) {
        window.preventItem(e);
        this.controller.onCollectionAddressChange(this.collectionAddressInput.value);
    },
    onCollectionAddressChange(value) {
        var _this = this;
        _this.setState({selectedCollection : null}, () => _this.controller.onCollectionAddressChange(value));
    },
    onTokenIdChange(value) {
        if (!this.state || !this.state.selectedCollection) {
            return;
        }
        this.state.selectedCollection.tokenId = value;
        this.controller.refreshBalanceOf();
    },
    onTokenAmountChange(value) {
        if (!this.state || !this.state.selectedCollection) {
            return;
        }
        this.state.selectedCollection.tokenAmount = value;
    },
    addObjectIdField(e) {
        window.preventItem(e);
        var _this = this;
        var objectIds = (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it)) || [];
        var element = null;
        var state = window.getState(this);
        state.key = new Date().getTime() + "" + Math.random();
        state.ref = ref => element && (element.instance = ref);
        objectIds.length && (state.removeMe = () => _this.setState({objectIds : (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it !== element)) || []}));
        objectIds.push(element = React.createElement(TransferInput, state));
        _this.setState({objectIds});
    },
    actionEnd() {
    },
    componentDidMount() {
        this.props.collectionAddress && this.controller.onCollectionAddressChange(this.collectionAddressInput.value = this.props.collectionAddress);
        window.setHomepageLink(`?section=transfer`);
    },
    render() {
        var state = this.state || {};
        return (<section className="Pager">
            <section className="wrapPage">
                <section className="wrapBox">
                    <section className="WrapWhat">
                        <p>Transfer Items</p>
                        <br/>
                        <input ref={ref => this.collectionAddressInput = ref} className="addressWrapSelector" type="text" placeholder="Collection address" data-action="onCollectionAddressChange" onKeyUp={window.onTextChange} onChange={window.onTextChange}/>
                        <a className="LoadToITEM" href="javascript:;" onClick={this.reloadCollection}>Load</a>
                    </section>
                    {state.selectedCollection && <section className="WrapWhatLoaded">
                        {(state.selectedCollection.name || state.selectedCollection.symbol) && <h6 className="tokenSelectedToWrap">{window.shortenWord(state.selectedCollection.name, 18)} {state.selectedCollection.symbol && state.selectedCollection.name ? ` (${window.shortenWord(state.selectedCollection.symbol, 10)})` : window.shortenWord(state.selectedCollection.symbol, 10)}</h6>}
                        <section className="tokenSelectedToWrapDecide">
                        <input type="text" className="SendtoWho" placeholder="Receiver address" ref={ref => this.receiverInput = ref}/>
                        {state.objectIds && state.objectIds.length > 0 && state.objectIds}
                        </section>
                        <label className="isBatch">
                            <input type="checkbox" onChange={this.onBatch} ref={ref => ref && (ref.checked = state.batch)}/>
                            <h5>Batch Transfer</h5>
                        </label>
                        {state.batch && <a className="tokenSelectedToWrapBalanceALL tokenSelectedToWrapBalanceADD" href="javascript:;" onClick={this.addObjectIdField}>+</a>}
                        <section className="WrapWhatLoaded">
                            <input type="text" className="SendtoWho" placeholder="Payload" ref={ref => this.payloadInput = ref}/>
                        </section>
                        {state.performing !== 'transfer' && <a className={"WrapToITEM" + (!state.selectedCollection ? " disabled" : "")} data-action="transfer" onClick={window.perform} href="javascript:;">TRANSFER</a>}
                        {state.performing === 'transfer' && <InnerLoader/>}
                    </section>}
                </section>
            </section>
        </section>);
    }
});