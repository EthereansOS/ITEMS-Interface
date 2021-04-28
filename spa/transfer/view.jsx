var Transfer = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx',
        'spa/loader.jsx',
        'spa/transfer/transferInput.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "wallet/update" : () => this.forceUpdate(),
            "ethereum/ping" : this.resetUI
        }
    },
    resetUI() {
        this.setState({selectedCollection : null});
    },
    getOwnedList() {
        var state = window.getState(this);
        return (state && state.collections && state.collections.filter(it => it.hasBalance)) || undefined;
    },
    onBatch(e) {
        var _this = this;
        _this.setState({ batch: e.currentTarget.checked }, () => {
            if (!_this.state.batch) {
                var objectIds = (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it)) || [];
                objectIds[0] && (objectIds = [objectIds[0]]);
                _this.setState({ objectIds });
            }
        });
    },
    selectCollection(e) {
        window.preventItem(e);
        this.controller.onCollectionAddressChange(this.collectionAddressInput.value = e.currentTarget.dataset.address);
    },
    addItem(e) {
        window.preventItem(e);
        var lastObjectId = this.state.objectIds[this.state.objectIds.length - 1];
        if (lastObjectId.instance.objectIdInput.value !== '') {
            this.setState({ batch: true });
            lastObjectId = this.addObjectIdField();
        }
        var objectId = e.currentTarget.dataset.objectid;
        setTimeout(function () {
            lastObjectId.instance.onItemChange(lastObjectId.instance.objectIdInput.value = objectId);
        }, 300);
    },
    reloadCollection(e) {
        window.preventItem(e);
        this.controller.onCollectionAddressChange(this.collectionAddressInput.value);
    },
    onCollectionAddressChange(value) {
        var _this = this;
        _this.setState({ selectedCollection: null }, () => _this.controller.onCollectionAddressChange(value));
    },
    addObjectIdField(e) {
        window.preventItem(e);
        var _this = this;
        var objectIds = (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it)) || [];
        var element = null;
        var state = window.getState(this);
        state.key = new Date().getTime() + "" + Math.random();
        state.ref = ref => element && (element.instance = ref);
        objectIds.length && (state.removeMe = () => _this.setState({ objectIds: (_this.state && _this.state.objectIds && _this.state.objectIds.filter(it => it !== element)) || [] }));
        objectIds.push(element = React.createElement(TransferInput, state));
        var state = { objectIds };
        if(objectIds.length > 1) {
            state.batch = true;
        }
        _this.setState(state);
        return element;
    },
    actionEnd() {
    },
    componentDidMount() {
        var _this = this;
        this.props.collectionAddress && this.controller.onCollectionAddressChange(this.collectionAddressInput.value = this.props.collectionAddress).then(() => _this.state.objectIds[0].instance.onItemChange(_this.state.objectIds[0].instance.objectIdInput.value = _this.props.objectId || ''));
        window.setHomepageLink(`?section=transfer`);
    },
    render() {
        var state = this.state || {};
        var list = this.getOwnedList();
        var walletLoaded = false;
        try {
            walletLoaded = $('.wallet').findReactComponent().state.loaded;
        } catch(e) {
        }
        return (<section className="Pager">
            <section className="wrapPage">
                <section className="wrapBox">
                    <section className="WrapWhat">
                        <p>Transfer Items</p>
                        <input type="text" className="SendtoWho" placeholder="Receiver address" ref={ref => this.receiverInput = ref} />
                        <p>Choose from Collections list:</p>
                        {(!list || (list.length === 0 && !walletLoaded)) && <Loader/>}
                        {list && list.length === 0 && walletLoaded && <h4>You don't own any ITEM</h4>}
                        {list && list.length > 0 && <ul className="SelectorToGo">
                            {list.map(it => <li key={it.address}>
                                <a href="javascript:;" data-address={it.address} onClick={this.selectCollection}>{window.shortenWord(it.name, 25)} {it.symbol && it.name ? ` (${window.shortenWord(it.symbol, 10)})` : window.shortenWord(it.symbol, 10)}</a>
                            </li>)}
                        </ul>}
                        {state.selectedCollection && <ul className="SelectorToGoSub">
                            <p>ITEMs:</p>
                            {Object.values(state.selectedCollection.items).filter(it => it.dynamicData && it.dynamicData.balanceOf && it.dynamicData.balanceOf !== '0').map(it => <li key={it.objectId}>
                                <a href="javascript:;" data-objectId={it.objectId} onClick={this.addItem}>{window.shortenWord(it.name, 25)} {it.symbol && it.name ? ` (${window.shortenWord(it.symbol, 10)})` : window.shortenWord(it.symbol, 10)}</a>
                            </li>)}
                        </ul>}
                        <br />
                        <p>or</p>
                        <br/>
                        <input ref={ref => this.collectionAddressInput = ref} className="addressWrapSelector" type="text" placeholder="Collection address" data-action="onCollectionAddressChange" onKeyUp={window.onTextChange} onChange={window.onTextChange} />
                        <a className="LoadToITEM" href="javascript:;" onClick={this.reloadCollection}>Load</a>
                    </section>
                </section>
                <section className="wrapBox">
                    
                    {state.selectedCollection && <section className="WrapWhatLoaded">
                        {(state.selectedCollection.name || state.selectedCollection.symbol) && <h6 className="tokenSelectedToWrap">{window.shortenWord(state.selectedCollection.name, 18)} {state.selectedCollection.symbol && state.selectedCollection.name ? ` (${window.shortenWord(state.selectedCollection.symbol, 10)})` : window.shortenWord(state.selectedCollection.symbol, 10)}</h6>}
                        <section className="tokenSelectedToWrapDecide">
                            {state.objectIds && state.objectIds.length > 0 && state.objectIds}
                        </section>
                        <label className="isBatch">
                            <input type="checkbox" onChange={this.onBatch} ref={ref => ref && (ref.checked = state.batch)} />
                            <h5>Batch Transfer</h5>
                        </label>
                        {state.batch && <a className="tokenSelectedToWrapBalanceALL tokenSelectedToWrapBalanceADD" href="javascript:;" onClick={this.addObjectIdField}>+</a>}
                        <section className="WrapWhatLoaded">
                            <input type="text" className="SendtoWho" placeholder="Payload" ref={ref => this.payloadInput = ref} />
                        </section>
                        {state.performing !== 'transfer' && <a className={"WrapToITEM" + (!state.selectedCollection ? " disabled" : "")} data-action="transfer" onClick={window.perform} href="javascript:;">TRANSFER</a>}
                        {state.performing === 'transfer' && <InnerLoader />}
                    </section>}
                </section>
            </section>
        </section>);
    }
});