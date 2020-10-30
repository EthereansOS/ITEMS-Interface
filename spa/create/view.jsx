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
    render() {
        var state = this.getState();
        return (<section className="Pager">
            <section className="createPage">
                {!state.create && <section className="createStart">
                    <h2>What do you want to do?</h2>
                    <a className={"" + (state.create === "CreateCollectionWizard" ? " selected" : "")} href="javascript:;" onClick={this.create} data-create="CreateCollectionWizard">Create a new Collection</a>
                    <a className={"" + (state.create === "CreateItemWizard" ? " selected" : "")} href="javascript:;" onClick={this.create} data-create="CreateItemWizard">Create a new ITEM</a>
                </section>}
                {state.create && React.createElement(state.create, state)}
            </section>
        </section>);
    }
});