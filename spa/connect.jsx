var Connect = React.createClass({
    render() {
        return (<section className="connectEtherean">
            <figure className="LoadImg">
                <img src="assets/img/loadMonolith.png"/>
            </figure>
            <section className="EnterSection">
            <h3>Welcome Etherean</h3>
            <a className="Enter" href="javascript:;" onClick={() => window.ethereum && window.ethereum.enable()}>Connect</a>
            <p>You need a <a target="_blank" href="https://etherscan.io/directory/Wallet">web3-enabler</a> to use this Dapp - If you have problems connecting, refresh the page.</p>
            </section>
        </section>);
    }
});