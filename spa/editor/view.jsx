var Editor = React.createClass({
    requiredScripts: [
        'assets/plugins/monaco.editor/monaco.editor.min.js'
    ],
    getDefaultSubscriptions() {
        return {
            'solc/version/change': this.changeSolcVersion,
            'editor/compile': this.tryCompile
        };
    },
    onEditor(ref) {
        var _this = this;
        if(!window.monaco) {
            return setTimeout(() => _this.onEditor(ref), 300);
        }
        ref && ((_this.props.secondCode === undefined || _this.props.secondCode === null) && (_this.props.second === undefined || _this.props.second === null)) && (_this.editor = window.monaco.editor.create(ref, {
            language: _this.props.lang || 'sol',
            theme: 'vs-dark',
            minimap: {
                enabled: false
            },
            readOnly: _this.props.readonly === 'true' || (_this.props.firstCode !== undefined && _this.props.firstCode !== null) || (_this.props.first !== undefined && _this.props.first !== null) || (_this.props.link !== undefined && _this.props.link !== null),
            value: _this.props.firstCode || ''
        })).onDidChangeModelContent(() => {
            try {
                _this.contentTokenInput && (_this.contentTokenInput.value = "");
                delete _this.contentTokenValue;
            } catch(e) {
            }
            _this.loadContentButton && $(_this.loadContentButton).removeClass('disabled');
            if(_this.oneWay) {
                delete _this.oneWay;
                return;
            }
            this.emit('smartContract/compilation', undefined);
        });
        if(ref && ((_this.props.secondCode !== undefined && _this.props.secondCode !== null) || (_this.props.second !== undefined && _this.props.second !== null))) {
            (_this.editor = window.monaco.editor.createDiffEditor(ref, {
                language: _this.props.lang || 'sol',
                theme: 'vs-dark',
                minimap: {
                    enabled: false
                },
                readOnly: true
            })).setModel({
                original: monaco.editor.createModel(_this.props.firstCode || '', 'sol'),
                modified: monaco.editor.createModel(_this.props.secondCode || '', 'sol')
            });
        }
        ref && _this.props.link && window.fetch(_this.props.link, {mode: 'no-cors'}).then(call => call.text()).then(data => _this.editor && _this.editor.setValue(data)).catch(() => _this.editor.setValue('Unable to show the code... Something shady is happening here.'));
        ref && _this.props.compileAtStart && _this.enqueue(_this.tryCompile, 500);
        ref && _this.props.sourceLocationId && _this.loadContent(_this.props.sourceLocationId, _this.props.sourceLocation);
    },
    commentChanged(comment, type) {
        var code = window.putComment(this.editor.getValue(), type, comment);
        code = window.putComment(code);
        var _this = this;
        _this.oneWay = true;
        _this.editor.setValue(code);
        setTimeout(function() {
            delete _this.oneWay;
        }, 300);
    },
    uploadFile(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var file = e.target.files[0];
        var _this = this;
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            _this.editor.setValue(Base64.decode(reader.result.substring(reader.result.indexOf(','))));
        }, false);
        reader.readAsDataURL(file);
    },
    onChange(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        var input = e.target;
        input.dataset.change === 'loadContent' && (delete this.contentTokenValue);
        input.dataset.change === 'loadContent' && this.loadContentButton && $(this.loadContentButton).removeClass('disabled');
    },
    onKeyUp(e) {
        if (!e || e.keyCode !== 13) {
            return this.onChange(e);
        }
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if($(this[e.currentTarget.dataset.change + 'Button']).hasClass('disabled')) {
            return;
        }
        this[e.currentTarget.dataset.change] && this[e.currentTarget.dataset.change](e);
        this.emit('editor/compile');
    },
    loadContent(e, contentAddress) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if(e && e.target && $(e.target).hasClass('disabled')) {
            return;
        }
        delete this.contentTokenValue;
        var input = !e || e.target ? this.contentTokenInput : e;
        var tokenId = isNaN(input) ? parseInt(input.value) : input;
        if (isNaN(tokenId)) {
            return;
        }
        var _this = this;
        _this.controller.loadContent(tokenId, contentAddress).then(() => {
            _this.contentTokenValue = tokenId;
            _this.loadContentButton && $(_this.loadContentButton).addClass('disabled');
            _this.contentTokenInput && !isNaN(input) && _this.enqueue(() => _this.contentTokenInput.value = '');
            _this.tryCompile();
        });
    },
    tryCompile(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.controller.tryCompile(200, e);
    },
    onSolidityVersion(ref) {
        var _this = this;
        if(!(_this.solidityVersion = ref)) {
            return;
        }
        window.SolidityUtilities.getCompilers().then(c => _this.solidityVersion && (_this.solidityVersion.innerHTML = Object.keys(c.releases).map(item => ('<option value="' + c.releases[item] + '">' + item + '</option>')).join('')));
    },
    changeSolcVersion(version) {
        this.solidityVersion.value = version;
    },
    recoverData() {
        var _this = this;
        return new Promise(function(ok, ko) {
            var contentToken = parseInt((_this.contentTokenInput && _this.contentTokenInput.value) || 0);
            var getOrDeploy = function() {
                var functionalityAddress = _this.functionalityAddress.value;
                if(window.isEthereumAddress(functionalityAddress)) {
                    return ok([contentToken, functionalityAddress]);
                }
                _this.controller.deploy().then(getOrDeploy).catch(ko);
            };
            if(!isNaN(contentToken)) {
                return _this.controller.mint().then(getOrDeploy).catch(ko);
            }
            return getOrDeploy();
        });
    },
    componentDidMount() {
        window.editorShortcut = window.editorShortcut || $(window).bind('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch (String.fromCharCode(e.which).toLowerCase()) {
                case 's':
                    e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
                    $.publish('editor/compile');
                    break;
                }
            }
        });
        !this.props.firstCode && this.props.first && this.controller.loadContent(this.props.first, this.props.firstLocation);
        !this.props.secondCode && this.props.second && this.controller.loadContent(this.props.second, this.props.secondLocation, true);
    },
    render() {
        return (
            <section className={this.props.className}>
                {!this.props.readonly && !this.props.firstCode && !this.props.first && !this.props.secondCode && !this.props.second && <div className="CodeEditorOptionsFrom">
                    <p className="CodeEditorOptionsWhat">Load from File: </p>
                    <input className="CodeEditorOptionsLoad" type="file" onChange={this.uploadFile} accept={this.props.lang && ("." + this.props.lang) || ".sol"} />
                </div>}
                {((this.props.readonly && this.props.compileAtStart) || (!this.props.readonly && !this.props.firstCode && !this.props.first && !this.props.secondCode && !this.props.second)) && <div className="CodeEditorOptionsCoding">
                    <p className="CodeEditorOptionsWhat">Solidity: </p>
                    <select id="selectedSolidityVersion" className="CodeEditorOptionsSelect" ref={this.onSolidityVersion} />
                </div>}
                <section className="NewProposaleditor" ref={this.onEditor} />
            </section>
        );
    }
});