var Wallet = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/lazyImageLoader.jsx'
    ],
    getInitialState() {
        return {
            loaded : false
        }
    },
    getList(ownedFirst) {
        return [
            ...(ownedFirst ? this.getOwnedList() : this.getHostList()),
            ...(ownedFirst ? this.getHostList() : this.getOwnedList())
        ]
    },
    getHostList() {
        var state = window.getState(this);
        var collections = state.collections;
        collections = collections.filter(it => it.hasBalance || it.isOwner);
        return collections.filter(it => it.isOwner);
    },
    getOwnedList() {
        var state = window.getState(this);
        var collections = state.collections;
        collections = collections.filter(it => it.hasBalance || it.isOwner);
        return collections.filter(it => it.hasBalance && !it.isOwner);
    },
    toggle(e) {
        window.preventItem(e);
        var state = window.getState(this);
        var oldToggle = state.toggle;
        var toggle = e.currentTarget.dataset.key;
        toggle = toggle === oldToggle ? null : toggle;
        if(toggle) {
            var collection = state.collections.filter(it => it.key === toggle)[0];
            if(!collection.hasBalance) {
                toggle = null;
            }
        }
        this.setState({ toggle });
    },
    goToCollection(e) {
        window.preventItem(e);
        var state = window.getState(this);
        var collection = state.collections.filter(it => it.key === e.currentTarget.dataset.key)[0];
        this.emit('wallet/toggle', false);
        this.emit('section/change', 'spa/collection', {
            collection,
            collectionAddress : collection.address,
            collections : state.collections
        });
    },
    goToItem(e) {
        window.preventItem(e);
        var state = window.getState(this);
        var collection = state.collections.filter(it => it.key === e.currentTarget.dataset.collection)[0];
        var item = collection.items[e.currentTarget.dataset.item];
        this.emit('wallet/toggle', false);
        this.emit('section/change', 'spa/item', {
            collection,
            item,
            collections: state.collections
        });
    },
    getDefaultSubscriptions() {
        return {
            "collections/refreshed": () => this.controller.loadData(),
            "ethereum/ping": () => this.controller.loadData(),
            "wallet/update" : () => this.forceUpdate()
        }
    },
    render() {
        var state = window.getState(this);
        if (!state.wallet) {
            return (<span style={{ "display": "none" }} />);
        }
        var hostList = (state.collections && this.getHostList()) || [];
        var ownedList = (state.collections && this.getOwnedList()) || [];
        return (
            <section className="sideALLThing">
                <a className="BoBoBoaThings" href="javascript:;" onClick={() => this.emit('wallet/toggle', false)}></a>
                <section className="sideThing">
                    <section className="mobileMenuWall OnlyMobileForNow">
                    <section className="menuSelections">
                        <section className="menuSelection">
                            <a target="_blank" href="https://ethitem.com/?section=explore" className="menuSelection BrandizedSSx">Explore</a>
                        </section>
                        <section className="menuSelection">
                            <a target="_blank" href="https://ethitem.com/?section=create" className="menuSelection BrandizedSSx">Create</a>
                        </section>
                        <section className="menuSelection">
                            <a target="_blank" href="https://ethitem.com/?section=wrap" className="menuSelection BrandizedSSx">Wrap</a>
                        </section>
                        <section className="menuSelection">
                            <a target="_blank" href="https://ethitem.com/?section=wrap" className="menuSelection BrandizedSSx">Transfer</a>
                        </section>
                        <section className="menuSelection">
                            <a target="_blank" href="https://ethitem.com/?section=farm" className="menuSelection BrandizedSSx">Farm</a>
                        </section>
                        <section className="menuSelection">
                            <a target="_blank" href="/doc.html" className="menuSelection BrandizedSSx">NERD</a>
                        </section>
                    </section>
                    </section>
                    <section className="Thewallet">
                        <h2>Hosted</h2>
                        {!state.loaded && <Loader/>}
                        {state.loaded && hostList.length === 0 && <h4>You didn't host any ITEM</h4>}
                        {state.loaded && hostList.length > 0 && hostList.map(collection => <section key={collection.key} className="walletCollection">
                            <section className="walletCollectionOpener">
                                <h5 className="walletCollectionOpenerName"><a href="javascript:;" data-key={collection.key} onClick={this.toggle}><span className="OPENSYMBOL">&#x276E;</span> {collection.name}</a></h5>
                                <a className="WOPENERBTN" href="javascript:;" data-key={collection.key} onClick={this.goToCollection}>Visit</a>
                                <a className="WOPENERBTN" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(collection.openSeaName)}>OpenSea</a>
                            </section>
                            {this.state && this.state.toggle === collection.key && <section className="walletCollectionItems">
                                {collection.items && Object.values(collection.items).filter(it => it.dynamicData && it.dynamicData.balanceOf && it.dynamicData.balanceOf !== '0').map(item => <section key={item.key} className="walletCollectionItem">
                                    <a href="javascript:;" onClick={this.goToItem} data-collection={collection.key} data-item={item.key}>
                                        <figure className="collectionIcon" style={{ "background-color": item.backgroundImage }}>
                                            <LazyImageLoader src={window.getElementImage(item)} />
                                            {item.dynamicData && <span className="walletCollectionItemQuantity">{window.formatMoney(item.dynamicData.balanceOfPlain, 1)}</span>}
                                        </figure>
                                    </a>
                                </section>)}
                            </section>}
                        </section>)}
                        <h2>Owned</h2>
                        {!state.loaded && <Loader/>}
                        {state.loaded && ownedList.length === 0 && <h4>You don't own any ITEM</h4>}
                        {state.loaded && ownedList.length > 0 && ownedList.map(collection => <section key={collection.key} className="walletCollection">
                            <section className="walletCollectionOpener">
                                <h5 className="walletCollectionOpenerName"><a href="javascript:;" data-key={collection.key} onClick={this.toggle}><span className="OPENSYMBOL">&#x276E;</span> {collection.name}</a></h5>
                                <a className="WOPENERBTN" href="javascript:;" data-key={collection.key} onClick={this.goToCollection}>Visit</a>
                                <a className="WOPENERBTN" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(collection.openSeaName)}>OpenSea</a>
                            </section>
                            {this.state && this.state.toggle === collection.key && <section className="walletCollectionItems">
                                {collection.items && Object.values(collection.items).filter(it => it.dynamicData && it.dynamicData.balanceOf && it.dynamicData.balanceOf !== '0').map(item => <section key={item.key} className="walletCollectionItem">
                                    <a href="javascript:;" onClick={this.goToItem} data-collection={collection.key} data-item={item.key}>
                                        <figure className="collectionIcon" style={{ "background-color": item.backgroundImage }}>
                                            <LazyImageLoader src={window.getElementImage(item)} />
                                            {item.dynamicData && <span className="walletCollectionItemQuantity">{window.formatMoney(item.dynamicData.balanceOfPlain, 1)}</span>}
                                        </figure>
                                    </a>
                                </section>)}
                            </section>}
                        </section>)}
                    </section>
                </section>
            </section>);
    }
});