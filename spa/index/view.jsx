var Index = React.createClass({
    requiredModules: [
        'spa/menu',
        'spa/wallet'
    ],
    requiredScripts: [
        'spa/connect.jsx',
        "spa/fullLoader.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update': this.controller.loadData,
            'ethereum/ping': this.controller.refreshCollectionData,
            'collections/refresh': this.controller.loadCollections,
            'section/change': this.sectionChange,
            "wallet/toggle": this.toggleWallet
        }
    },
    toggleWallet(w) {
        var wallet = w;
        if (wallet === undefined || wallet === null) {
            wallet = !(this.state && this.state.wallet);
        }
        wallet && $('body').addClass('noScroll');
        !wallet && $('body').removeClass('noScroll');
        this.setState({ wallet });
    },
    componentDidMount() {
        this.controller.loadData();
    },
    sectionChange(module, props) {
        var _this = this;
        var section = module.split('/');
        section = section[section.length - 1].firstLetterToUpperCase();
        ReactModuleLoader.load({
            modules: [module],
            callback: () => _this.setState({ section, props }, () => _this.toggleWallet(false))
        });
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        props.props && Object.entries(props.props).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        if (!window.walletAddress) {
            return (<Connect />);
        }
        return (<section>
            <section>
                <Menu onSelection={this.sectionChange} />
            </section>
            {props.section && <section>
                {React.createElement(window[props.section], props)}
            </section>}
            {React.createElement(Wallet, props)}
            <footer>
            <section>
                <a target="_blank" href="https://github.com/b-u-i-d-l/ethItem">Github</a>
                <a target="_blank" href="/doc.html">Documentation</a>
                <a target="_blank" href="https://dapp.dfohub.com/?addr=0x7cB2Aa86fC0F3dA708783168BFd25B80F045d183">ETHITEM Governance</a>
                <a target="_blank" href="https://covenants.eth.link/#/farm/dapp/0x0074f1D1D1F0086F46EA102380635fCC460c212b">Farm ARTE</a>
                <a href="https://ethos.eth.link/" target="_blank">EthOS</a>
                <a href="javascript:;" data-section="explore" onclick="window.connectFromHomepage(this)" target="_blank">Explore Items</a>
                <a href="javascript:;" data-section="wrap" onclick="window.connectFromHomepage(this)" target="_blank">Wrap to Items</a>
                <a href="javascript:;" data-section="create" onclick="window.connectFromHomepage(this)" target="_blank">Create Items</a>
                <a href="javascript:;" data-section="farm" onclick="window.connectFromHomepage(this)" target="_blank">Farm Items</a>
                <a target="_blank" href="https://whereismydragon.eth.link" class="Brandized">Where is my dragon?</a>
            </section>
            <section>
                <p>ETHITEM is a new protocol on top of Ethereum, it's an R&D project made by the EthOS team. Use it at your own risk!</p>
            </section>
            <img className="FooterImg" src="assets/img/footer.png"></img>
        </footer>
        </section>);
    }
});