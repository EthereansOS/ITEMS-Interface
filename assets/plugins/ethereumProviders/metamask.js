var MetamaskEthereumProvider = function MetamaskEthereumProvider() {
    return {
        async retrieveProvider() {
            window.ethereum && await window.ethereum.enable();
            return window.web3 && window.web3.currentProvider;
        }
    };
}();