var Wallet = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/lazyImageLoader.jsx'
    ],
    getList() {
        var state = window.getState(this);
        var collections = state.collections;
        return collections.filter(it => it.hasBalance);
    },
    toggle(e) {
        window.preventItem(e);
        var oldToggle = this.state && this.state.toggle;
        var toggle = e.currentTarget.dataset.key;
        toggle = toggle === oldToggle ? null : toggle;
        this.setState({toggle});
    },
    onClick(e) {
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
            "collections/refresh": () => this.controller.loadData(),
            "wallet/update": () => this.controller.loadData(),
            "ethereum/ping": () => this.controller.loadData()
        }
    },
    render() {
        var state = window.getState(this);
        if (!state.wallet) {
            return (<span style={{ "display": "none" }} />);
        }
        return (
            <section className="sideALLThing">
                <section className="sideThing">
                    {!state.loaded && <Loader />}
                    <section className="Thewallet">
                        {state.collections && this.getList().map(collection => <section key={collection.key} className="walletCollection">
                            <section className="walletCollectionOpener">
                                <a href="javascript:;" data-key={collection.key} onClick={this.toggle}>
                                    <h5 className="walletCollectionOpenerName">{collection.name}</h5>
                                    {collection.isOwner && <h6>I am the owner</h6>}
                                </a>
                            </section>
                            {this.state && this.state.toggle === collection.key && <section className="walletCollectionItems">
                                {collection.items && Object.values(collection.items).filter(it => it.dynamicData && it.dynamicData.balanceOf && it.dynamicData.balanceOf !== '0').map(item => <section key={item.key} className="walletCollectionItem">
                                    <a href="javascript:;" onClick={this.onClick} data-collection={collection.key} data-item={item.key}>
                                        <figure className="collectionIcon" style={{ "background-color": item.backgroundImage }}>
                                            {item.image && <LazyImageLoader src={item.image} />}
                                            {item.dynamicData && <span className="walletCollectionItemQuantity">{item.dynamicData.balanceOfPlain}</span>}
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