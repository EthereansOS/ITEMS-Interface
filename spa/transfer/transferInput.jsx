var TransferInput = React.createClass({
    max(e) {
        window.preventItem(e);
        this.objectValueInput.value = '';
        try {
            this.objectValueInput.value = this.props.selectedCollection.items[this.objectIdInput.value].dynamicData.balanceOfPlain;
        } catch(e) {
        }
    },
    render() {
        return (
        <section className="WrapWhatLoaded">
            {this.props.removeMe && <a className="tokenSelectedToWrapBalanceALL tokenSelectedToWrapBalanceREM" href="javascript:;" onClick={this.props.removeMe}>X</a>}
            <input className="SendtoWho" placeholder="Intem ID" type="text" ref={ref => this.objectIdInput = ref}/>
            <section className="tokenSelectedToWrapDecide">
                <a className="tokenSelectedToWrapBalanceALL" href="javascript:;" onClick={this.max}>MAX</a>
                <input className="BalancetoWrapSelector" placeholder="Ammount" type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" data-action="onTokenAmountChange" ref={ref => this.objectValueInput = ref}/>
                <span className="Error" ref={ref => this.errorField = ref}></span>
            </section>
        </section>);
    }
});