var CreateCollectionWizard = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx'
    ],
    requiredModules: [
        'spa/editor'
    ],
    getDefaultSubscriptions() {
        return {
            'smartContract/compilation': this.onSmartContract
        };
    },
    compile(e) {
        window.preventItem(e);
        this.contractSelect.innerHTML = "";
        this.emit('editor/compile');
    },
    onSmartContract(contract) {
        this.contractSelect.innerHTML = "";
        if (!contract) {
            return;
        }
        var data = [];
        var keys = Object.keys(contract);
        for (var key of keys) {
            var item = contract[key];
            if (item.bytecode === '0x') {
                continue;
            }
            data.push(key);
        }
        this.contractSelect.innerHTML = data.map(it => `<option value="${it}">${it}</option>`).join('');
    },
    getState() {
        var state = {};
        this.props && Object.entries(this.props).forEach(entry => state[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => state[entry[0]] = entry[1]);
        state.props && Object.entries(state.props).forEach(entry => state[entry[0]] = entry[1]);
        delete state.props;
        return state;
    },
    onExtension(e) {
        this.setState({ extension: e.currentTarget.value, extensionAddress: null });
    },
    onMetadataType(e) {
        this.setState({ metadataType: e.currentTarget.value, metadataLink: null, metadata: null });
    },
    onENSChange(e) {
        window.preventItem(e);
        var _this = this;
        var then = function then(ensResult) {
            var result = "";
            if (ensResult[0]) {
                result = "&#" + (ensResult[1] ? "9940" : "9989") + ";";
            }
            _this.result.innerHTML = result;
        };
        _this.controller.checkENS().then(then);
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
        return window.getData(this.metadataPage);
    },
    renderMetadata() {
        var state = this.getState();
        return (<section ref={ref => window.setData(this.metadataPage = ref, state.metadata)}>
            <section>
                <label>
                    <span>Image (mandatory)</span>
                    <input id="image" data-mandatory="true" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                </label>
            </section>
            <section>
                <label>
                    <span>HD Image</span>
                    <input id="image_data" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                </label>
            </section>
            <section>
                <label>
                    <span>Description (mandatory)</span>
                    <textarea id="description" data-mandatory="true" />
                </label>
            </section>
            <section>
                <label>
                    <span>Background Color (mandatory)</span>
                    <input id="background_color" data-mandatory="true" type="color" />
                </label>
            </section>
            <section>
                <label>
                    <span>Discussion link</span>
                    <input id="discussionUri" type="text" />
                </label>
            </section>
            <section>
                <label>
                    <span>DNS link</span>
                    <input id="externalDNS" type="text" />
                </label>
            </section>
            <section>
                <label>
                    <span>ENS link</span>
                    <input id="externalENS" type="text" />
                </label>
            </section>
            <section>
                <label>
                    <span>Repo link</span>
                    <input id="repoUri" type="text" />
                </label>
            </section>
        </section>);
    },
    renderStep0() {
        var state = this.getState();
        return (<section className="createCollection">
            <h2>Let's start from the basics</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <p>Name</p>
                    <input type="text" ref={ref => (this.collectionName = ref) && (ref.value = state.collectionName || "")} />
                </section>
                <section className="FormCreateThing">
                    <p>Symbol</p>
                    <input type="text" ref={ref => (this.collectionSymbol = ref) && (ref.value = state.collectionSymbol || "")} />
                </section>
                <section className="FormCreateThing">
                    <p>ENS <span ref={ref => this.result = ref} /></p>
                    <input data-action="onENSChange" className="inENS" type="text" ref={ref => (this.collectionENS = ref) && (ref.value = state.collectionENS || "")} onChange={window.onTextChange} onKeyUp={window.onTextChange} />
                    <span className="inENSitem">.ITEM.eth</span>
                </section>
                <section className="FormCreateThing">
                    <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
                </section>
            </section>
        </section>);
    },
    renderStep1() {
        var state = this.getState();
        var extension = state.extension;
        return (<section className="createCollection">
            <h2>Who is the owner?</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <span className="createDescriptonX">The owner of the collection is who have the ability to mint ITEMS, it can be anyone, an address or you can extend it with custom rules via deploying an extension conctract. <a href="">More info</a></span>
                </section>
                <section className="FormCreateThing">
                    <select className="" onChange={this.onExtension}>
                        <option value="">Select</option>
                        <option value="wallet" selected={extension === 'wallet'}>Wallet</option>
                        <option value="contract" selected={extension === 'contract'}>Smart Contract</option>
                    </select>
                </section>
                {extension === "wallet" &&
                    <section className="FormCreateThing">
                        <input type="text" placeholder="address" ref={ref => this.extensionAddressInput = ref} />
                    </section>}
            </section>
            <section className="FormCreateThing">
                <a className="SuperActionBTN" href="javascript:;" onClick={this.back}>BACK</a>
                <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep2() {
        var state = this.getState();
        var extension = state.extension;
        return (<section className="createCollection">
            <h2>Granularity</h2>
            <section className="FormCreateThing">
                <label>
                    <p>Decimals</p>
                    <input type="checkbox" ref={ref => (this.hasDecimals = ref) && (ref.checked = state.hasDecimals)} />
                    <span>Selecting this option, all the Items of this Collection will have 18 decimals instead of 1</span>
                </label>
            </section>
            <section className="FormCreateThing">
                <a className="SuperActionBTN" href="javascript:;" onClick={this.back}>BACK</a>
                <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep3() {
        var state = this.getState();
        var metadataType = state.metadataType;
        return (<section className="createCollection">
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
                <a className="SuperActionBTN" href="javascript:;" onClick={this.back}>BACK</a>
                <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep4() {
        var state = this.getState();
        var extension = state.extension;
        return (<section className="createCollection">
            {extension === "contract" && <h2>Etension Contract</h2>}
            {extension !== "contract" && <h2>Deploy</h2>}
            {extension === "contract" && <section className="FormCreate">
                <section className="FormCreateThing">
                    <Editor ref={ref => this.editor = ref} />
                    <button onClick={this.compile}>Compile</button>
                    <select ref={ref => this.contractSelect = ref} />
                    <section>
                        <p>Extension init payload (optional)</p>
                        <input type="text" placeholder="Payload" ref={ref => this.extensionAddressPayload = ref} />
                        <span>See the documentation for further details.</span>
                    </section>
                </section>
            </section>}
            <section className="FormCreateThing">
                <a className={"SuperActionBTN" + (this.state && this.state.performing) ? " disabled" : ""} href="javascript:;" onClick={this.back}>BACK</a>
                {(!this.state || this.state.performing !== 'deploy') && <a href="javascript:;" data-action="deploy" className="SuperActionBTN" onClick={window.perform}>DEPLOY</a>}
                {this.state && this.state.performing === 'deploy' && <InnerLoader />}
            </section>
        </section>);
    },
    render() {
        return (this[`renderStep${this.getState().step || 0}`]());
    }
});