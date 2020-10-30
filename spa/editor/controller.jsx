var EditorController = function (view) {
    var context = this;
    context.view = view;

    context.loadContent = async function loadContent(tokenId, contentAddress, isSecond) {
        try {
            context.view.emit('message', 'Retrieving Content Token...');
            var value = await window.loadContent(tokenId, contentAddress);
            !context.view.props.secondCode && !context.view.props.second && context.view.editor.setValue(value);
            if(context.view.props.secondCode || context.view.props.second) {
                var model = context.view.editor.getModel();
                model[isSecond ? 'modified' : 'original'] = monaco.editor.createModel(value, 'sol')
                context.view.editor.setModel(model);
            }
            context.view.contentTokenInput && setTimeout(() => context.view.contentTokenInput.value = tokenId);
            context.view.emit('message');
        } catch (e) {
            context.view.emit('message', e.message || e, 'error');
        }
    };

    context.tryCompile = async function tryCompile(optimization, silent) {
        context.view.emit('smartContract/compilation', undefined);
        context.view.emit('smartContract/compiling');
        try {
            var code = context.view.editor.getValue();
            var comments = window.extractComment(code);
            Object.keys(comments).map(key => context.view.emit('comment/changed', comments[key], key));
            if (!code) {
                if (window.isEthereumAddress(context.view.functionalityAddressValue)) {
                    silent !== true && context.view.emit('message', 'Retrieving Solidity version...');
                    context.view.solidityVersion.value = await window.SolidityUtilities.getSolcVersion(context.view.functionalityAddressValue);
                    silent !== true && context.view.emit('message');
                }
                context.view.emit('smartContract/compilation', undefined);
                return;
            }
            code = window.getCompleteCode ? (await window.getCompleteCode(code)) : code; 
            if (!window.isEthereumAddress(context.view.functionalityAddressValue)) {
                silent !== true && context.view.emit('message', 'Compiling SmartContract...');
                var compiled = await SolidityUtilities.compile(code, context.view.solidityVersion.value, optimization);
                silent !== true && context.view.emit('message');
                context.view.emit('smartContract/compilation', compiled);
                return compiled;
            }
            silent !== true && context.view.emit('message', 'Comparing SmartContracts...');
            var comparedContract = await window.SolidityUtilities.compare(context.view.functionalityAddressValue, code);
            comparedContract && (context.view.solidityVersion.value = comparedContract.solcVersion); 
            silent !== true && context.view.emit('message');
            context.view.emit('smartContract/compilation', comparedContract);
            return comparedContract;
        } catch (e) {
            context.view.emit('smartContract/compilation', undefined);
            silent !== true && context.view.emit('message', e.message || e, 'error');
        }
    };
};