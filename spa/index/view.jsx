var Index = React.createClass({
    requiredModules: [
        'spa/menu',
        'spa/wallet'
    ],
    requiredScripts: [
        'spa/connect.jsx'
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
        wallet && this.emit("wallet/update");
        this.setState({ wallet });
    },
    componentDidMount() {
        var _this = this;
        this.controller.loadData().then(() => _this.emit('wallet/update'));
    },
    sectionChange(module, props) {
        var _this = this;
        var section = module.split('/');
        section = section[section.length - 1].firstLetterToUpperCase();
        ReactModuleLoader.load({
            modules: [module],
            callback: () => _this.setState({ section, props })
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
        </section>);
    }
});