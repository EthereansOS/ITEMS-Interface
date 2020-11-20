var TransferController = function (view) {
    var context = this;
    context.view = view;

    context.onCollectionAddressChange = async function onCollectionAddressChange(address) {
        try {
            address = window.web3.utils.toChecksumAddress(address);
        } catch(e) {
            address = undefined;
        }
        if(!window.isEthereumAddress(address)) {
            return context.view.setState({selectedCollection : null, objectIds : null});
        }
        var selectedCollection = context.view.props.collections.filter(it => it.address === address)[0];
        selectedCollection = selectedCollection || await window.loadSingleCollection(address, true);
        try {
            var promises = [];
            selectedCollection.items = selectedCollection.items || {};
            var collectionObjectIds = await window.loadCollectionItems(selectedCollection.address);
            for (var objectId of collectionObjectIds) {
                promises.push(window.loadItemData(selectedCollection.items[objectId] = selectedCollection.items[objectId] || {
                    objectId,
                    collection : selectedCollection
                }, selectedCollection));
            }
            await Promise.all(promises);
        } catch (e) {
        }
        context.view.setState({selectedCollection, objectIds : null}, () => {
            context.refreshData();
            context.view.addObjectIdField();
        });
    };

    context.refreshData = async function refreshData() {
    };

    context.performTransfer = async function performTransfer() {
        var state = window.getState(context.view);
        var selectedCollection = state.selectedCollection;
        if(!selectedCollection) {
            return;
        }
        var receiver = context.view.receiverInput.value;
        if(!receiver || !window.isEthereumAddress(receiver)) {
            throw "Receiver must be a valid Ethereum address";
        }
        var payload;
        try {
            payload = context.view.payloadInput.value;
        } catch(e) {
        }
        var totalAmounts = {}
        var objectIds = [];
        var amounts = [];
        var error = false;
        for(var transferInput of state.objectIds) {
            var transferInputInstance = transferInput.instance;
            transferInputInstance.errorField.innerHTML = '';
            var item = selectedCollection.items[transferInputInstance.objectIdInput.value];
            if(!item) {
                transferInputInstance.errorField.innerHTML = 'Item id not valid';
                error = true;
                continue;
            }
            var objectId = item.objectId;
            totalAmounts[objectId] = totalAmounts[objectId] || '0';
            var value = transferInputInstance.objectValueInput.value;
            var valueDecimals = window.toDecimals(value, item.decimals);
            if(valueDecimals === '0') {
                transferInputInstance.errorField.innerHTML = 'Amount must be greater than 0';
                error = true;
                continue;
            }
            totalAmounts[objectId] = window.web3.utils.toBN(totalAmounts[objectId]).add(window.web3.utils.toBN(valueDecimals)).toString();
            if(parseInt(totalAmounts[objectId]) > parseInt(item.dynamicData.balanceOf)) {
                transferInputInstance.errorField.innerHTML = 'Total amount to transfer exceedes allowance';
                error = true;
                continue;
            }
            objectIds.push(objectId);
            amounts.push(valueDecimals);
        }
        if(error) {
            return;
        }
        if(objectIds.length === 0) {
            throw "At least an Item must be chosen";
        }
        var method = 'safeBatchTransferFrom';
        if(!state.batch) {
            method = "safeTransferFrom";
            objectIds = objectIds[0];
            amounts = amounts[0];
        }
        await window.blockchainCall(selectedCollection.contract.methods[method], window.walletAddress, receiver, objectIds, amounts, payload || '0x');
    };
};