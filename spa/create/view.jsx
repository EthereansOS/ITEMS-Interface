var Create = React.createClass({
    requiredModules: [
        'spa/createCollectionWizard',
        'spa/createItemWizard'
    ],
    getState() {
        var state = {};
        this.props && Object.entries(this.props).forEach(entry => state[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => state[entry[0]] = entry[1]);
        state.props && Object.entries(state.props).forEach(entry => state[entry[0]] = entry[1]);
        delete state.props;
        return state;
    },
    create(e) {
        window.preventItem(e);
        this.setState({ create: e.currentTarget.dataset.create });
    },
    componentDidMount() {
        window.setHomepageLink(`?section=create`);
        var collectionAddress = window.consumeAddressBarParam("collectionAddress");
        collectionAddress && this.setState({create : 'CreateItemWizard', collectionAddress});
    },
    render() {
        var state = this.getState();
        return (<section className="Pager">
            <section className="createPage">
                {!state.create && <section className="createStart">
                    <a className={"StartCreate" + (state.create === "CreateCollectionWizard" ? " selected" : "")} href="javascript:;" onClick={this.create} data-create="CreateCollectionWizard">Create a New Collection</a>
                    <a className={"StartCreate" + (state.create === "CreateItemWizard" ? " selected" : "")} href="javascript:;" onClick={this.create} data-create="CreateItemWizard">Create a New ITEM</a>
                </section>}
                {state.create && React.createElement(state.create, state)}
            </section>
        </section>);
    }
});