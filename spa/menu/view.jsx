var Menu = React.createClass({
    getDefaultSubscriptions() {
        return {
            'section/change' : this.onSection
        }
    },
    onSection(section) {
        this.setState({selected : this.state.menu.indexOf(this.state.menu.filter(it => it.module === section || it.otherModules && it.otherModules.filter(otherModule => otherModule === section).length > 0)[0])});
    },
    componentDidMount() {
        this.controller.loadData();
    },
    onSelection(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        _this.setState({ selected: e.currentTarget.dataset.index }, function () {
            _this.props.onSelection(_this.state.menu[_this.state.selected].module);
        });
    },
    onCollectionAddress(e) {
        window.preventItem(e);
        this.emit('collection/search', this.searchInput.value);
    },
    render() {
        var _this = this;
        return (
            <section className="menuMenu">
                <a className="logo"><section className="logoimg"></section><span className="BrandizedSSxY"> ETHITEM</span></a>
                <section className="menuSelections">
                    {this.state && this.state.menu && this.state.menu.map((it, i) =>
                        <section className="menuSelection" key={it.module}>
                            <a href="javascript:;" data-index={i} className={"menuSelection BrandizedSSx" + ((i + "") === (this.state.selected + "") ? " Selected" : "")} onClick={_this.onSelection}>{it.name}</a>
                        </section>)}
                </section>
                <section className="search">
                    <input ref={ref => this.searchInput = ref} type="search" data-action="onCollectionAddress" onChange={window.onTextChange} onKeyUp={window.onTextChange}/>
                    <a href="javascript:;" onClick={this.onCollectionAddress}>&#x021B5;</a>
                </section>
                {!window.walletAddress && <a className="connectWallet Brandized" href="javascript:;" onClick={window.ethereum.enable}>CONNECT</a>}
                {window.walletAddress && <a className="connectWallet" href="javascript:;" onClick={() => this.emit('wallet/toggle')}><img src={window.makeBlockie(window.walletAddress)} /><span>{window.shortenWord(window.walletAddress, 5, true)} &#8592;</span></a>}
            </section>);
    }
});