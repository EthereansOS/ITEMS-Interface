var Wrap = React.createClass({
    render() {
        return(
        <section className="Pager">
            <section className="wrapPage">
                    <section className="wrapBox">
                        <section className="WrapWhat">
                            <p>Wrap an existing Token or NFT into an ITEM</p>
                            <input className="addressWrapSelector" type="text" placeholder="ERC20 721 1155 address"></input>
                            <a className="LoadToITEM">Load</a>
                        </section>


                        <section className="WrapWhatLoaded">
                            <h6 className="tokenSelectedToWrap">Penguin (WIMD)</h6>
                            <span className="tokenSelectedToWrapBalance">balance: 1,000</span>
                            <section className="tokenSelectedToWrapDecide">
                                <a className="tokenSelectedToWrapBalanceALL">MAX</a>
                                <input className="BalancetoWrapSelector" placeholder="Ammount" type="number"></input>
                            </section>
                            <a className="BeforeToWrapToITEM disabled">Accept</a><a className="WrapToITEM">ITEMIZE</a>
                        </section>
                    </section>
            </section>
        </section>);
    }
});