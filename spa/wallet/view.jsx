var Wallet = React.createClass({
    render() {
        return(
        <section className="sideThing">
            <section className="wallet">
                <section className="walletCollection">
                    <section className="walletCollectionOpener">
                        <h5 className="walletCollectionOpenerName">Collection 1</h5>
                    </section>
                    <section className="walletCollectionItems">
                        <section className="walletCollectionItem">
                            <a>
                                <figure>
                                    <img></img>
                                    <span className="walletCollectionItemQuantity"></span>
                                </figure>
                            </a>
                        </section>
                    </section>
                </section>
            </section>
        </section>);
    }
});