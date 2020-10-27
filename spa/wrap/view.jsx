var Wrap = React.createClass({
    render() {
        return(
        <section className="Pager">
            <section className="wrapPage">
                <section className="wrapSystem">
                    <section className="wrapBox">
                        <section className="WrapWhat">
                            <input className="addressWrapSelector" type="text" placeholder="ERC20 721 1155 address"></input>
                            <a className="LoadToITEM">Load</a>
                        </section>
                        <section className="WrapWhat">
                            <h6 className="tokenSelectedToWrap">Penguin (WIMD)</h6>
                            <span className="tokenSelectedToWrapBalance">balance: 1,000</span>
                            <input className="BalancetoWrapSelector" type="number"></input>
                            <a>Accept</a><a className="WrapToITEM">ITEMIZE</a>
                        </section>
                    </section>
                </section>
            </section>
        </section>);
    }
});