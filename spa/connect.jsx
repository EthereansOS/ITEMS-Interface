var Connect = React.createClass({
    render() {
        return (<section>
            <h3>To start, please connect your wallet</h3>
            <a href="javascript:;" onClick={() => window.ethereum && window.ethereum.enable()}>Connect</a>
            <p>You need to have a <a target="_blank" href="https://etherscan.io/directory/Wallet">Web3-enabled browser</a> to navigate in this Dapp</p>
        </section>);
    }
});