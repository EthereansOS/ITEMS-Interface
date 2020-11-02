var Explore = React.createClass({
    getDefaultSubscriptions() {
        return {
            "collection/search": this.controller.onCollectionSearch
        }
    },
    requiredScripts: [
        'spa/loader.jsx'
    ],
    requiredModules: [
        'spa/singleCollection'
    ],
    onClick(e) {
        window.preventItem(e);
        var collection = this.state && this.state.searchedCollection;
        var index = e.currentTarget.dataset.index;
        if(index !== undefined && index !== null) {
            collection = this.props.collections[parseInt(index)];
        }
        this.emit('section/change', 'spa/collection', { collection });
    },
    render() {
        var _this = this;
        return (<section className="Pager">
            {(!this.state || !this.state.searchedCollection) && this.props.loadingCollections && <Loader />}
            {(!this.state || !this.state.searchedCollection) && this.props.collections && <section className="collections">
                <section className="collectionsList">
                    {this.props.collections.map(it => <a key={it.key} data-index={it.index} href="javascript:;" onClick={_this.onClick}>
                        <SingleCollection collection={it} />
                    </a>)}
                </section>
            </section>}
            {this.state && this.state.searchedCollection && <section className="collections">
                <section className="collectionsList">
                    <a href="javascript:;" onClick={_this.onClick}>
                        <SingleCollection collection={this.state.searchedCollection} />
                    </a>
                </section>
            </section>}
        </section>);
    }
});