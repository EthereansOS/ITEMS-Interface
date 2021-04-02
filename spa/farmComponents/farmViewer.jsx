var FarmViewer = React.createClass({
    requiredScripts: [
        "spa/farmComponents/farmViewWrapped.jsx"
    ],
    getProps() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        return props;
    },
    componentDidMount() {
        var _this = this;
        window.loadFarmingContracts({
            collectionAddress : this.props.collectionAddress,
            itemAddress : this.props.itemAddress
        }).then(fc => {
            var farmingContracts = [];
            Object.values(fc).forEach(it => Object.keys(it).forEach(key => farmingContracts.push(key)));
            _this.setState({farmingContracts});
        });
    },
    render() {
        return (<section className="DappBox">
            {(!this.state || !this.state.farmingContracts) && <Loader/>}
            {this.state && this.state.farmingContracts && this.state.farmingContracts.length === 0 && <h4>No Farming Contracts</h4>}
            {this.state && this.state.farmingContracts && this.state.farmingContracts.map(farmAddress => React.createElement(FarmViewWrapped, {...this.getProps(), farmAddress}))}
        </section>);
    }
});