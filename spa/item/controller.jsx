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

        await window.blockchainCall(context.view.props.item.collection.contract.methods.mint, context.view.props.item.objectId, amount);
        window.context.updateItemDynamicData(this.props.item, context.view);
    }
};