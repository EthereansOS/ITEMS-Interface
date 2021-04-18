var CreateItemWizard = React.createClass({
    requiredScripts: [
        'spa/innerLoader.jsx',
        'spa/fullLoader.jsx'
    ],
    getState() {
        var state = {};
        this.props && Object.entries(this.props).forEach(entry => state[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => state[entry[0]] = entry[1]);
        state.props && Object.entries(state.props).forEach(entry => state[entry[0]] = entry[1]);
        delete state.props;
        return state;
    },
    onFileOrFolder(e) {
        window.preventItem(e);
        var _this = this;
        this.setState({fileOrFolder : e.currentTarget.value}, function() {
            _this.fileOrFolder.directory = _this.state.fileOrFolder === 'folder';
            _this.fileOrFolder.webkitdirectory = _this.state.fileOrFolder === 'folder';
        });
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
        var metadata = window.getData(this.metadataPage);
        metadata.name = this.state.itemName;
        metadata.symbol = this.state.itemSymbol;
        return metadata;
    },
    renderMetadataBasic() {
        var state = this.getState();
        return (<section className="MetaDataThings" ref={ref => window.setData(this.metadataPage = ref, state.metadata)}>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Description<b>*</b></p>
                    <textarea id="description" data-mandatory="true" />
                </label>
                <span className="ExplBoom">The description of this new awesome Item</span>
            </section>
            <section className="spacialImputs">
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Cover<b>*</b></p>
                        <input id="image" data-mandatory="true" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">The cover img must be .png or .gif and at max 5mb lenght, due to users experience in IPFS download speed limitations (recommended size 350 x 200, 350 x 350 or 350 x 500)</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>ITEM Img content HD</p>
                        <input id="image_data" type="file" accept=".png, .jpeg, .gif" />
                    </label>
                    <span className="ExplBoom">No limitations for the HQ version of the image</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Animation:</p>
                        <input id="animation_url" type="file" accept={'.' + Object.keys(window.context.supportedAnimationFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">an mp4, mp3 or gif file as a fancy animated version of your ITEM</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Background Color<b>*</b></p>
                        <input id="background_color" data-mandatory="true" type="color" />
                    </label>
                    <span className="ExplBoom">The background color used in most of the dapps behind your cover if not fixed with their standard image sizes</span>
                </section>
                <section className="MetaImputThings">
                    <section className="createWhat">
                        <p>File or Folder</p>
                        <select className="FF" id="fileType" onChange={this.onFileOrFolder}>
                            <option value="file">File</option>
                            <option value="folder">Folder</option>
                        </select>
                        <input id={this.state && this.state.fileOrFolder === 'folder' ? 'folder' : 'file'} ref={ref => this.fileOrFolder = ref} type="file" webkitdirectory={this.state && this.state.fileOrFolder === 'folder'} directory={this.state && this.state.fileOrFolder === 'folder'}/>
                    </section>
                </section>
                <span className="ExplBoom">The file or folder of the ITEM (if Any).</span>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Licence File</p>
                        <input id="licence_url" type="file" accept=".pdf, .html, .md, .txt"/>
                    </label>
                    <span className="ExplBoom">A file that represent the legal licence of the ITEM (if Any). Accepted file: .pdf, .html, .md, .txt</span>
                </section>
            </section>
        </section>);
    },
    renderMetadataArt() {
        var state = this.getState();
        return (<section className="MetaDataThings" ref={ref => window.setData(this.metadataPage = ref, state.metadata)}>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Artwork Description<b>*</b></p>
                    <textarea id="description" data-mandatory="true" />
                </label>
                <span className="ExplBoom">The description of this new awesome Artwork</span>
            </section>
            <section className="spacialImputs">
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Artwork Cover<b>*</b></p>
                        <input id="image" data-mandatory="true" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">The cover img must be .png or .gif and at max 5mb lenght, due to users experience in IPFS download speed limitations (recommended size 350 x 200, 350 x 350 or 350 x 500)</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Artwork Cover HD</p>
                        <input id="image_data" type="file" accept=".png, .jpeg, .gif" />
                    </label>
                    <span className="ExplBoom">No limitations for the HQ version of the Artwork</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Animation:</p>
                        <input id="animation_url" type="file" accept={'.' + Object.keys(window.context.supportedAnimationFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">an mp4, mp3 or gif file as a fancy animated version of your Artwork</span>
                </section>
                <section className="MetaImputThings">
                    <section className="createWhat">
                        <p>Artwork Extra File or Folder</p>
                        <select className="FF" id="fileType" onChange={this.onFileOrFolder}>
                            <option value="file">File</option>
                            <option value="folder">Folder</option>
                        </select>
                        <input id={this.state && this.state.fileOrFolder === 'folder' ? 'folder' : 'file'} ref={ref => this.fileOrFolder = ref} type="file" webkitdirectory={this.state && this.state.fileOrFolder === 'folder'} directory={this.state && this.state.fileOrFolder === 'folder'}/>
                    </section>
                    <span className="ExplBoom">The file or folder of the ITEM (if Any).</span>
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
                        <p>Licence</p>
                        <input id="licence_url" type="file" accept=".pdf, .html, .md, .txt"/>
                    </label>
                    <span className="ExplBoom">A file that represent the legal licence of the Artwork (if Any). Accepted file: .pdf, .html, .md, .txt</span>
                </section>
            </section>
        </section>);
    },
    renderMetadataVoxel() {
        var state = this.getState();
        return (<section className="MetaDataThings" ref={ref => window.setData(this.metadataPage = ref, state.metadata)}>
            <section className="MetaImputThings">
                <label className="createWhat">
                    <p>Artwork Description<b>*</b></p>
                    <textarea id="description" data-mandatory="true" />
                </label>
                <span className="ExplBoom">The description of this new awesome Artwork</span>
            </section>
            <section className="spacialImputs">
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Artwork Cover<b>*</b></p>
                        <input id="image" data-mandatory="true" type="file" accept={'.' + Object.keys(window.context.supportedImageFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">The cover img must be .png or .gif and at max 5mb lenght, due to users experience in IPFS download speed limitations (recommended size 350 x 200, 350 x 350 or 350 x 500)</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Artwork Cover HD</p>
                        <input id="image_data" type="file" accept=".png, .jpeg, .gif" />
                    </label>
                    <span className="ExplBoom">No limitations for the HQ version of the Artwork</span>
                </section>
                <section className="MetaImputThings">
                    <label className="createWhat">
                        <p>Animation:</p>
                        <input id="animation_url" type="file" accept={'.' + Object.keys(window.context.supportedAnimationFileExtensions).join(', .')} />
                    </label>
                    <span className="ExplBoom">an mp4, mp3 or gif file as a fancy animated version of your Artwork</span>
                </section>
                <section className="MetaImputThings">
                    <section className="createWhat">
                        <p>Artwork Extra File or Folder</p>
                        <select className="FF" id="fileType" onChange={this.onFileOrFolder}>
                            <option value="file">File</option>
                            <option value="folder">Folder</option>
                        </select>
                        <input id={this.state && this.state.fileOrFolder === 'folder' ? 'folder' : 'file'} ref={ref => this.fileOrFolder = ref} type="file" webkitdirectory={this.state && this.state.fileOrFolder === 'folder'} directory={this.state && this.state.fileOrFolder === 'folder'}/>
                    </section>
                    <span className="ExplBoom">The file or folder of the ITEM (if Any).</span>
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
                        <p>Licence</p>
                        <input id="licence_url" type="file" accept=".pdf, .html, .md, .txt"/>
                    </label>
                    <span className="ExplBoom">A file that represent the legal licence of the Artwork (if Any). Accepted file: .pdf, .html, .md, .txt</span>
                </section>
            </section>
        </section>);
    },
    renderStep0() {
        var state = this.getState();
        return (<section className="createITEM">
            <section className="FormCreateThing">
                <h2>Collection:</h2>
                <input ref={ref => (this.tokenAddressInput = ref) && (ref.value = (state.selectedToken && state.selectedToken.address) || "")} className="addressWrapSelector" type="text" placeholder="Token address" data-action="onTokenAddressChange" onKeyUp={this.onChange} onChange={this.onChange} />
            </section>
            {state.selectedToken && <section className="CollectionLoaded">
                <p>{state.selectedToken.name} <span> ({state.selectedToken.symbol})</span></p>
                {!state.selectedToken.canMint && <span>This Collection cannot be extended any more</span>}
            </section>}
            <section className="FormCreateThing">
                <a className={"SuperActionBTN" + (state.selectedToken && state.selectedToken.canMint ? "" : " disabled")} href="javascript:;" onClick={this.next}>NEXT</a>
            </section>
        </section>);
    },
    renderStep1() {
        return (<section className="createITEM">
            <h2>Let’s Start With the Basics</h2>
            <section className="FormCreate">
                <section className="FormCreateThing">
                    <p>Name</p>
                    <input type="text" ref={ref => (this.itemName = ref)} />
                </section>
                <section className="FormCreateThing">
                    <p>Symbol</p>
                    <input type="text" ref={ref => (this.itemSymbol = ref) && (ref.value = this.state.itemSymbol || this.state.selectedToken.symbol)} />
                </section>
                <section className="FormCreateThing">
                    <p>Supply</p>
                    <input type="text" placeholder="0.00" spellcheck="false" autocomplete="off" autocorrect="off" inputmode="decimal" pattern="^[0-9][.,]?[0-9]$" ref={ref => (this.itemSupply = ref) && (ref.value = this.state.itemSupply || "")} />
                </section>
                <section className="FormCreateThing">
                    <label>
                        <p>You'll maintain the right to mint new?</p>
                        <input type="checkbox" ref={ref => (this.itemMintable = ref) && (ref.checked = this.state.itemMintable)} />
                    </label>
                </section>
                <section className="FormCreateThing">
                    <a className="SuperActionBTN SuperActionBTNB" href="javascript:;" onClick={this.back}>BACK</a>
                    <a className="SuperActionBTN" href="javascript:;" onClick={this.next}>NEXT</a>
                </section>
            </section>
        </section>);
    },
    renderStep2() {
        var state = this.getState();
        if(state.loadingMessage === this.controller.deployingItemMessage) {
            return (<FullLoader/>);
        }
        var metadataType = state.metadataType;
        return (<section className="createITEM">
            <section className="FormCreate">
                <h2>Metadata</h2>
                <select className="" onChange={this.onMetadataType}>
                    <option value="">Select</option>
                    <option value="basic" selected={metadataType === "basic"}>Basic</option>
                    <option value="art" selected={metadataType === "art"}>Crypto Art</option>
                    <option value="custom" selected={metadataType === "custom"}>Custom</option>
                </select>
                {metadataType === 'basic' && this.renderMetadataBasic()}
                {metadataType === 'art' && this.renderMetadataArt()}
                {metadataType === 'custom' && <section className="FormCreateThing">
                    <p>Metadata Link</p>
                    <input type="text" ref={ref => (this.metadataLinkInput = ref) && (this.state && this.state.metadataLink && (ref.value = (this.state && this.state.metadataLink)))} />
                    <span className="ExplBoom">The metadata file is a Json standard file containing all of the info and links to the file of the ITEM. <a href="/doc.html#6" target="_blank">here</a> You can find a step by step guide to build your json file correctly. | Link must be expressed in ipfs://ipfs/0000000000..</span>
                </section>}
                <section className="FormCreateThing">
                    <a className={"SuperActionBTN SuperActionBTNB" + (this.state && this.state.performing ? " disabled" : "")} href="javascript:;" onClick={this.back}>BACK</a>
                    {(!this.state || this.state.performing !== 'deploy') && <a href="javascript:;" data-action="deploy" className="SuperActionBTN" onClick={window.perform}>DEPLOY</a>}
                    {this.state && this.state.performing === 'deploy' && <InnerLoader />}
                    {this.state && this.state.loadingMessage && <span>{this.state.loadingMessage}</span>}
                </section>
            </section>
        </section>);
    },
    componentDidMount() {
        this.props.collectionAddress && this.controller.onTokenAddressChange(this.props.collectionAddress);
    },
    render() {
        return (this[`renderStep${this.getState().step || 0}`]());
    }
});