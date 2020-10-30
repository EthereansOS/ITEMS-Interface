var CreateCollectionWizard = React.createClass({
    getState() {
        var state = {};
        this.props && Object.entries(this.props).forEach(entry => state[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => state[entry[0]] = entry[1]);
        state.props && Object.entries(state.props).forEach(entry => state[entry[0]] = entry[1]);
        delete state.props;
        return state;
    },
    catch(e) {
        if(!e) {
            return;
        }
        var message = e.message || e;
        if(message.toLowerCase().indexOf("user denied") !== -1) {
            return;
        }
        return alert(message);
    },
    next(e) {
        window.preventItem(e);
        if(e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1) {
            return;
        }
        var currentStep = (this.getState().step || 0);
        var step = currentStep + 1;
        if (currentStep >= this.steps) {
            return;
        }
        var _this = this;
        var setState = function setState() {
            _this.setState({ step });
        };
        try {
            var checkStepFunction = this.controller[`checkStep${currentStep}`] && this.controller[`checkStep${currentStep}`]();
            if(!checkStepFunction || !checkStepFunction.then) {
                return setState();
            }
            checkStepFunction.then(setState).catch(this.catch);
        } catch(e) {
            this.catch(e);
        }
    },
    back(e) {
        window.preventItem(e);
        var currentStep = (this.getState().step || 0) - 1;
        if(currentStep < 0) {
            return;
        }
        this.setState({step : currentStep});
    },
    steps : 2,
    renderStep0() {
        return (<section className="createCollection">
            <h2>Let's start from the basics</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <p>Name</p>
                    <input />
                </section>
                <section className="FormCreateThing">
                    <p>Symbol</p>
                    <input />
                </section>
                <section className="FormCreateThing">
                    <p>Description</p>
                    <input />
                </section>
                <section className="FormCreateThing">
                    <p>ENS</p>
                    <input />
                </section>
                <section className="FormCreateThing">
                    <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
                </section>
            </section>
        </section>);
    },
    renderStep1() {
        return (<section className="createCollection">
            <h2>Who is the owner?</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <select></select>
                </section>
                <section className="FormCreateThing">
                    <a>Anyone</a>
                </section>
                <section className="FormCreateThing">
                    <a>Contract</a>
                </section>
            </section>
            <section className="FormCreateThing">
                <span>The owner of the collection is who have the ability to mint ITEMS, it can be anyone, an address or you can extend it with custom rules via deploying an extension conctract. More info <a>Here</a></span>
                <a className="SuperActionBTN" href="javascript:;" onClick={this.back}>BACK</a>
                <a className="SuperActionBTN">DEPLOY</a>
            </section>
        </section>);
    },
    render() {
        return (this[`renderStep${this.getState().step || 0}`]());
    }
});