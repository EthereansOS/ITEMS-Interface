var SuccessPage = React.createClass({
    requiredScripts : [
        'spa/lazyImageLoader.jsx'
    ],
    createItem(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/create', {create: "CreateItemWizard", collectionAddress : this.props.collectionAddress});
    },
    wrapItem(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/wrap');
    },
    goToItem(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/item', {
            collection : this.props.collection,
            item : this.props.item
        });
    },
    goToCollection(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/collection', { collection: this.props.collection });
    },
    render() {
        var state = window.getState(this);
        return (<section className="Pager yeahPage">
            {/* After creating a Collection */}
            {state.created === 'collection' && <section className="AllDoneBro">
                <h2>{state.name} is now a real thing!</h2>
                <figure>
                    <LazyImageLoader src={window.formatLink(state.image)}/>
                </figure>
                <p>Spread the word using this link <a href={window.formatLink(state.external_url)} target="_blank">{state.external_url}</a></p>
                <h2>And now?</h2>
                <a className="Enter" href="javascript:;" onClick={this.createItem}>Create the first Item</a>
                <p><a href="javascript:;" onClick={this.goToCollection}>Go to the Collection page</a></p>
            </section>}
            {/* After creating an ITEM */}
            {state.created === 'item' && <section className="AllDoneBro">
                <h2>You have successfully created this amazing new ITEM!</h2>
                <figure>
                    <LazyImageLoader src={window.formatLink(state.image)}/>
                </figure>
                <p>Spread the word using this link <a href={window.formatLink(state.external_url)} target="_blank">{state.external_url}</a></p>
                <h2>And now?</h2>
                <a className="Enter" href="javascript:;" onClick={this.createItem}>Create another Item</a>
                <p><a href="javascript:;" onClick={this.goToItem}>Go to the ITEM page</a></p>
            </section>}
            {/* After wrapping an ITEM */}
            {state.created === 'wrap' && <section className="AllDoneBro">
                <h2>You have successfully wrapped {state.tokenAmount} {state.name}</h2>
                <h2>And now?</h2>
                <a className="Enter" href="javascript:;" onClick={this.wrapItem}>Wrap another Item</a>
                <p><a href="javascript:;" onClick={this.goToItem}>Go to the ITEM page</a></p>
            </section>}
        </section>);
    }
});