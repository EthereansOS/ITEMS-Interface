var CreateCollectionWizard = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx',
        'spa/fullLoader.jsx'
    ],
    requiredModules: [
        'spa/editor'
    ],
    getDefaultSubscriptions() {
        return {
            'smartContract/compilation': this.onSmartContract,
            'smartContract/compiling' : () => this.compileButton.innerHTML = "Compiling..."
        };
    },
    compile(e) {
        window.preventItem(e);
        this.contractSelect.innerHTML = "";
        this.emit('editor/compile');
    },
    onSmartContract(contract) {
        this.compileButton.innerHTML = "Compile";
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
        if (!this[`renderStep${step}`] || e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1) {
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
        if (currentStep < 0 || e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1) {
            return;
        }
        this.setState({ step: currentStep });
    },
    getMetadataValues() {
        return window.getData(this.metadataPage);
    },
    renderMetadata() {
        var state = this.getState();
        return (<section className="MetaDataThings" ref={ref => window.setData(this.metadataPage = ref, state.metadata)}>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Description<b>*</b></p>
                    <textarea id="description" data-mandatory="true" />
                </label>
                <span className="ExplBoom">The description of this new awesome collection</span>
            </section>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Discussion link</p>
                    <input id="discussionUri" type="text" />
                </label>
                <span className="ExplBoom">A link to a forum, chat o community where people can interact about this project</span>
            </section>
            {/*<section className="MetaImputThings">
                <label className="createWhat">
                    <p>External URL<b>*</b></p>
                    <input id="external_url" type="text" />
                </label>
                <span className="ExplBoom">The external URL to reach info about this collection</span>
            </section>*/}
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>DNS link</p>
                    <input id="externalDNS" type="text" />
                </label>
                <span className="ExplBoom">A link to the official website of this project</span>
            </section>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>ENS link</p>
                    <input id="externalENS" type="text" />
                </label>
                <span className="ExplBoom">An ENS link to the official website of this project</span>
            </section>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Repo link</p>
                    <input id="repoUri" type="text" />
                </label>
                <span className="ExplBoom">A link to the official repo of this project</span>
            </section>
            <section className="spacialImputs">
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Cover Regular<b>*</b></p>
                        <input id="image" data-mandatory="true" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">The cover image must be .png or .gif, with a size limit of 5 MB and max. width of 350px, due to users experience in IPFS download speed limitations</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Cover High Quality</p>
                        <input id="image_data" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">No limitations for the HQ version of the image</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Background Color<b>*</b></p>
                        <input id="background_color" data-mandatory="true" type="color" />
                    </label>
                    <span className="ExplBoom">The background color used in most of the dapps behind your cover if not fixed with their standard image sizes</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Licence File</p>
                        <input id="licence_url" type="file" accept=".pdf,.html,.md,.txt"/>
                    </label>
                    <span className="ExplBoom">A file that represent the legal licence of all of ITEMs in the collection (if Any). Accepted file: .pdf, .html, .md, .txt</span>
                </section>
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
                {/*<section className="FormCreateThing">
                    <p>ENS <span ref={ref => this.result = ref} /></p>
                    <input data-action="onENSChange" className="inENS" type="text" ref={ref => (this.collectionENS = ref) && (ref.value = state.collectionENS || "")} onChange={window.onTextChange} onKeyUp={window.onTextChange} />
                    <span className="inENSitem">.ITEM.eth</span>
                </section>*/}
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
            <h2>Who is the host?</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <span className="createDescriptonX">The host of the collection is who have the ability to mint ITEMS, it can be anyone, an address or you can extend it with custom rules via deploying an extension conctract. <a href="">More info</a></span>
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
                <a className="SuperActionBTN SuperActionBTNB" href="javascript:;" onClick={this.back}>BACK</a>
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
                </label>
                <span className="ExplBoom">By selecting this option, all of the Items in this Collection will have 18 decimals in both implementations (Recommended only if you need decimals in the NFT implementation too. For example to realize special functions like in-game consumable items)</span>
            </section>
            <section className="FormCreateThing">
                <a className="SuperActionBTN SuperActionBTNB" href="javascript:;" onClick={this.back}>BACK</a>
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
                <span className="ExplBoom">The metadata file is a JSON standard file containing all of the info and links to the file of the ITEM. <a href="/doc.html#6" target="_blank">Here</a> You can find a step by step guide to build your json file correctly. | Link must be expressed in ipfs://ipfs/0000000000..</span>
            </section>}
            <section className="FormCreateThing">
                <a className="SuperActionBTN SuperActionBTNB" href="javascript:;" onClick={this.back}>BACK</a>
                <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep4() {
        var state = this.getState();
        if(state.loadingMessage ===  this.controller.deployingCollectionMessage) {
            return (<FullLoader/>);
        }
        var extension = state.extension;
        return (<section className="createCollection">
            {extension === "contract" && <h2>Etension Contract</h2>}
            {extension !== "contract" && <h2>Deploy</h2>}
            {extension === "contract" && <section className="FormCreate">
                <section className="FormCreateThing FormCreateThingBig">
                    <Editor ref={ref => this.editor = ref} />
                    <button className="BTNweirdo" ref={ref => this.compileButton = ref} onClick={this.compile}>Compile</button>
                    <select ref={ref => this.contractSelect = ref} />
                    <section className="FormCreateThing">
                        <input className="payloadThing" type="text" placeholder="Payload if any" ref={ref => this.extensionAddressPayload = ref} />
                    </section>
                </section>
            </section>}
            <section className="FormCreateThing">
                <a className={"SuperActionBTN SuperActionBTNB" + (this.state && this.state.performing ? " disabled" : "")} href="javascript:;" onClick={this.back}>BACK</a>
                {this.state && !this.state.performing && !this.state.extensionAddress && <a href="javascript:;" data-action="deploySmartContract" className="SuperActionBTN" onClick={window.perform}>DEPLOY SMART CONTRACT</a>}
                {this.state && !this.state.performing && this.state.extensionAddress && <a href="javascript:;" data-action="deploy" className="SuperActionBTN" onClick={window.perform}>CREATE COLLECTION</a>}
                {this.state && this.state.performing && <InnerLoader />}
                {this.state && this.state.loadingMessage && <span>{this.state.loadingMessage}</span>}
                <p className="risksDisc">ETHITEM is a general purposes protocol to build ITEMs on top of Ethereum, anyone can do it! By deploying you're taking the full responsability for your creation. Do it at your own risk.</p>
            </section>
        </section>);
    },
    render() {
        return (this[`renderStep${this.getState().step || 0}`]());
    }
});