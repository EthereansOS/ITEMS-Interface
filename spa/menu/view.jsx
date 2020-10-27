var Menu = React.createClass({
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
    render() {
        var _this = this;
        return (
            <section className="menuMenu">
                <a className="logo"><section className="logoimg"></section><span className="BrandizedSSx"> ETHITEM</span></a>
                <section className="menuSelections">
                    {this.state && this.state.menu && this.state.menu.map((it, i) =>
                        <section className="menuSelection" key={it.module}>
                            <a href="javascript:;" data-index={i} className={"menuSelection BrandizedSSx" + ((i + "") === (this.state.selected + "") ? " Selected" : "")} onClick={_this.onSelection}>{it.name}</a>
                        </section>)}
                </section>
                <section className="search">
                    <input type="search"></input>
                    <a>&#x021B5;</a>
                </section>
                {!window.walletAddress && <a className="connectWallet Brandized" href="javascript:;" onClick={window.ethereum.enable}>CONNECT</a>}
                {window.walletAddress && <a className="connectWallet Brandized" target="_blank" href={`${window.getNetworkElement("etherscanURL")}address/${window.walletAddress}`} onClick={window.ethereum.enable}><img src={window.makeBlockie(window.walletAddress)}/><span>{window.shortenWord(window.walletAddress, 5, true)}</span></a>}
            </section>);
    }
});