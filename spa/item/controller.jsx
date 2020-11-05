var ItemController = function (view) {
    var context = this;
    context.view = view;

    context.performMint = async function performMint() {
        var amountPlain = context.view.mintMoreInput.value.split(',').join("");
        var amountPlainNumber = window.asNumber(amountPlain);
        if(isNaN(amountPlainNumber) || amountPlainNumber <= 0) {
            throw "Amount to mint must be a number greater than 0";
        }

        var decimals = window.asNumber(context.view.props.item.collection.decimals);
        var amount = decimals === 1 ? amountPlain : window.toDecimals(amountPlain, decimals);

        await window.blockchainCall(context.view.props.item.collection.contract.methods['mint(uint256,uint256)'], context.view.props.item.objectId, amount);
        window.updateItemDynamicData(this.props.item, context.view);
    };

    context.performUnwrap = async function performUnwrap() {
        var amountPlain = context.view.unwrapInput.value.split(',').join("");
        var amountPlainNumber = window.asNumber(amountPlain);
        if(isNaN(amountPlainNumber) || amountPlainNumber <= 0) {
            throw "Amount to unwrap must be a number greater than 0";
        }

        var decimals = window.asNumber(context.view.props.item.collectionDecimals);
        var amount = decimals === 1 ? amountPlain : window.toDecimals(amountPlain, decimals);
        if(window.asNumber(amount) > window.asNumber(context.view.props.item.dynamicData.balanceOfCollectionSide)) {
            throw "You specified an insufficient amount";
        }
        await window.blockchainCall(context.view.props.item.collection.contract.methods.burn, context.view.props.item.objectId, amount);
        window.updateItemDynamicData(this.props.item, context.view);
    };
};