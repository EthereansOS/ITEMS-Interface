var CreateItemWizard = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx'
    ],
    getState() {
        var state = {};
        this.props && Object.entries(this.props).forEach(entry => state[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => state[entry[0]] = entry[1]);
        state.props && Object.entries(state.props).forEach(entry => state[entry[0]] = entry[1]);
        delete state.props;
        return state;
    },
    onChange(e) {
        window.preventItem(e);
        if (this.state && this.state.performing) {
            return;
        }
        var value = e.currentTarget.value;
        var callback = this[e.currentTarget.dataset.action];
        var timeVar = e.currentTarget.dataset.action + "Timeout";
        this[timeVar] && window.clearTimeout(this[timeVar]);
        this[timeVar] = setTimeout(() => callback(value), window.context.inputTimeout);
    },
    onTokenAddressChange(value) {
        this.controller.onTokenAddressChange(value)
    },
    onMetadataType(e) {
        this.setState({ metadataType: e.currentTarget.value, metadataLink : null, metadata : null });
    },
    catch(e) {
        if (!e) {
            return;
        }
        var message = e.message || e;
        if (message.toLowerCase().indexOf("user denied") !== -1) {
            return;
        }
        return alert(message);
    },
    next(e) {
        window.preventItem(e);
        if (e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1) {
            return;
        }
        var currentStep = (this.getState().step || 0);
        var step = currentStep + 1;
        if (!this[`renderStep${step}`]) {
            return;
        }
        var _this = this;
        var setState = function setState() {
            _this.setState({ step });
        };
        try {
            var checkStepFunction = this.controller[`checkStep${currentStep}`] && this.controller[`checkStep${currentStep}`]();
            if (!checkStepFunction || !checkStepFunction.then) {
                return setState();
            }
            checkStepFunction.then(setState).catch(this.catch);
        } catch (e) {
            this.catch(e);
        }
    },
    back(e) {
        window.preventItem(e);
        var currentStep = (this.getState().step || 0) - 1;
        if (currentStep < 0) {
            return;
        }
        this.setState({ step: currentStep });
    },
    getMetadataValues() {
        return {};
    },
    renderMetadata() {
        var state = this.getState();
        return(<section>
            <section>
                <label>Field 1</label>
                <input type="text"/>
            </section>
            <section>
                <label>Field 2</label>
                <input type="text"/>
            </section>
            <section>
                <label>Field 3</label>
                <input type="text"/>
            </section>
            <section>
                <label>Field 4</label>
                <input type="text"/>
            </section>
        </section>);
    },
    renderStep0() {
        var state = this.getState();
        return (<section className="createITEM">
            <section className="FormCreateThing">
                <h2>Collection:</h2>
                <input ref={ref => (this.tokenAddressInput = ref) && (ref.value = (state.selectedToken && state.selectedToken.address) || "")} className="addressWrapSelector" type="text" placeholder="Token address" data-action="onTokenAddressChange" onKeyPress={this.onChange} onChange={this.onChange} />
            </section>
            {state.selectedToken && <section>
                <span>Name: {state.selectedToken.name}</span>
                <span>Symbol: {state.selectedToken.symbol}</span>
                {!state.selectedToken.canMint && <span>This Collection cannot be extended any more</span>}
            </section>}
            <section className="FormCreateThing">
                <a className={"SuperActionBTN" + (state.selectedToken && state.selectedToken.canMint ? "" : " disabled")} href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep1() {
        return (<section className="createITEM">
            <h2>Let's start from the basics</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <p>Name</p>
                    <input type="text" ref={ref => (this.itemName = ref) && (ref.value = this.state.itemName || this.state.selectedToken.name)} />
                </section>
                <section className="FormCreateThing">
                    <p>Symbol</p>
                    <input type="text" ref={ref => (this.itemSymbol = ref) && (ref.value = this.state.itemSymbol || this.state.selectedToken.symbol)} />
                </section>
                <section className="FormCreateThing">
                    <p>Supply</p>
                    <input type="text" ref={ref => (this.itemSupply = ref) && (ref.value = this.state.itemSupply || "")} />
                </section>
                <section className="FormCreateThing">
                    <label>
                        <p>You'll maintain the right to mint new?</p>
                        <input type="checkbox" ref={ref => (this.itemMintable = ref) && (ref.checked = this.state.itemMintable)} />
                    </label>
                </section>
                <section className="FormCreateThing">
                    <a className="SuperActionBTN" href="javascript:;" onClick={this.back}>BACK</a>
                    <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
                </section>
            </section>
        </section>);
    },
    renderStep2() {
        var state = this.getState();
        var metadataType = state.metadataType;
        return (<section className="createITEM">
            <h2>Now it's time to add some info</h2>
            <section className="FormCreate">
                <h2>Metadata</h2>
                <select className="" onChange={this.onMetadataType}>
                    <option value="">Select</option>
                    <option value="basic" selected={metadataType === "basic"}>Basic</option>
                    <option value="custom" selected={metadataType === "custom"}>Custom</option>
                </select>
                {metadataType === 'basic' && this.renderMetadata()}
                {metadataType === 'custom' && <section className="FormCreateThing">
                    <p>Metadata Link</p>
                    <input type="text" ref={ref => (this.metadataLinkInput = ref) && (ref.value = (this.state && this.state.metadataLink) || "")} />
                    <span>The metadata file is a Json standard file containing all of the info and links to the file of the ITEM. <a>here</a> You can find a step by step guide to build your json file correctly.</span>
                </section>}
                <section className="FormCreateThing">
                    <a className={"SuperActionBTN" + (this.state && this.state.performing) ? " disabled" : ""} href="javascript:;" onClick={this.back}>BACK</a>
                    {(!this.state || this.state.performing !== 'deploy') && <a href="javascript:;" data-action="deploy" className="SuperActionBTN" onClick={window.perform}>DEPLOY</a>}
                    {this.state && this.state.performing === 'deploy' && <InnerLoader />}
                </section>
            </section>
        </section>);
    },
    componentDidMount() {
        this.props.address && this.controller.onTokenAddressChange(this.props.address);
    },
    render() {
        return (this[`renderStep${this.getState().step || 0}`]());
    }
});