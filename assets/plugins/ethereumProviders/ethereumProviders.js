var EthereumProviders = function EthereumProviders() {
    return {
        "list": [{
            "name" : "Metamask"
        }, {
            "name" : "WalletConnect",
            "reconnectionNotSupported": true
        }, {
            "name" : "Fortmatic",
            "disabled" : true
        }, {
            "name" : "Portis",
            "disabled" : true
        }, {
            "name" : "Coinbase",
            "disabled" : true
        }],
        activate(wallet) {
            if (!wallet) {
                return;
            }
            window.localStorage.removeItem("selectedEthereumProvider");
            return new Promise(function(ok, ko) {
                try {
                    wallet.script = wallet.script || "assets/plugins/ethereumProviders/" + wallet.name.split(' ').join('').firstLetterToLowerCase() + ".js";
                    wallet.scriptName = wallet.scriptName || wallet.name.split(' ').join('') + 'EthereumProvider';
                    ScriptLoader.load({
                        scripts: [wallet.script],
                        async callback() {
                            try {
                                var provider = await window[wallet.scriptName].retrieveProvider();
                                delete window.networkId;
                                await window.onEthereumUpdate(provider);
                                provider && !wallet.reconnectionNotSupported && window.localStorage.setItem("selectedEthereumProvider", window.EthereumProviders.list.indexOf(wallet) + '');
                                return ok();
                            } catch (e) {
                                return ko(e);
                            }
                        }
                    });
                } catch (e) {
                    return ko(e);
                }
            });
        }
    }
}();
(typeof window.localStorage.selectedEthereumProvider).toLowerCase() !== "undefined" && window.EthereumProviders.activate(window.EthereumProviders.list[window.localStorage.selectedEthereumProvider]);