var TransferInput = React.createClass({
    max(e) {
        window.preventItem(e);
        this.objectValueInput.value = '';
        try {
            this.objectValueInput.value = this.props.selectedCollection.items[this.objectIdInput.value].dynamicData.balanceOfPlain;
        } catch(e) {
        }
    },
    onItemChange(tokenId) {
        var item = this.props.selectedCollection.items[tokenId];
        if(!item) {
            return this.setState({name: null, symbol : null, balanceOfPlain : null});
        }
        this.setState({
            name : item.name,
            symbol : item.symbol,
            balanceOfPlain : (item.dynamicData && item.dynamicData.balanceOfPlain) || '0'
        });
    },
    render() {
        return (
        <section className="WrapWhatLoaded">
            {this.props.removeMe && <a className="tokenSelectedToWrapBalanceALL tokenSelectedToWrapBalanceREM" href="javascript:;" onClick={this.props.removeMe}>X</a>}
            <input className="SendtoWho" placeholder="Intem ID" type="text" ref={ref => this.objectIdInput = ref} data-action="onItemChange" onKeyUp={window.onTextChange} onChange={window.onTextChange}/>
            {this.state && (this.state.name || this.state.symbol) && <h6 className="tokenSelectedToWrap">{window.shortenWord(this.state.name, 10)} {this.state.symbol && this.state.name ? ` (${window.shortenWord(this.state.symbol, 10)})` : window.shortenWord(this.state.symbol, 10)}</h6>}
            {this.state && this.state.balanceOfPlain && <span className="tokenSelectedToWrapBalance">balance: {this.state.balanceOfPlain}</span>}
            <section className="tokenSelectedToWrapDecide">
                <a className="tokenSelectedToWrapBalanceALL" href="javascript:;" onClick={this.max}>MAX</a>
                <input className="BalancetoWrapSelector" placeholder="Ammount" type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" ref={ref => this.objectValueInput = ref}/>
                <span className="Error" ref={ref => this.errorField = ref}></span>
            </section>
        </section>);
    }
});