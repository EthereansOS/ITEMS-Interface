var Collection = React.createClass({
    requiredModules: [
        'spa/singleCollection',
        'spa/collectionSingleItem',
        'spa/editor'
    ],
    getInitialState() {
        return {
            toggle: "items"
        }
    },
    toggle(e) {
        window.preventItem(e);
        var oldToggle = this.state && this.state.toggle;
        var toggle = e.currentTarget.dataset.toggle;
        toggle = oldToggle === toggle ? null : toggle;
        this.setState({ toggle });
    },
    onCollectionObjectIds(collectionObjectIds) {
        this.props.collection.items = this.props.collection.items || {};
        this.setState({ collectionObjectIds });
    },
    createMoreItems(e) {
        window.preventItem(e);
        this.emit('section/change', 'spa/create', { create: "CreateItemWizard", collectionAddress: this.props.collection.address });
    },
    componentDidMount() {
        var _this = this;
        window.setHomepageLink(`?collection=${this.props.collection.address}`);
        window.retrieveAndCheckModelCode(this.props.collection).then(() => _this.forceUpdate());
    },
    render() {
        return (<section className="Pager">
            <section className="collectionPage">
                <SingleCollection collection={this.props.collection} className="collectionPageInfo" showLink showItemsCount onCollectionObjectIds={this.onCollectionObjectIds} />
                <section className="collectionNav">
                    <ul>
                        <li className={this.state && this.state.toggle === 'items' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle} data-toggle="items">Items</a></li>
                        <li className={this.state && this.state.toggle === 'farm' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle} data-toggle="farm">Farm</a></li>
                        {this.props.collection && (this.props.collection.extensionCode || this.props.collection.modelCode) && <li className={this.state && this.state.toggle === 'code' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle} data-toggle="code">Code</a></li>}
                    </ul>
                </section>
                {this.props.collection && this.state && this.state.toggle === 'items' && <section className="collectionPageItems">
                    {this.props.collection.isOwner && <a className="Enter" href="javascript:;" onClick={this.createMoreItems}>Add New</a>}
                    <section className="collectionPageItemsOrder">
                        {!this.state.collectionObjectIds && <Loader />}
                        {this.state.collectionObjectIds && this.state.collectionObjectIds.map(it => <CollectionSingleItem key={it} objectId={it} collection={this.props.collection} miniature />)}
                    </section>
                </section>}
                {this.state && this.state.toggle === 'farm' && <section className="collectionPageItemsFarm">
                    <section>
                        <section className="SoonFARM">
                                <figure className="FarmImg">
                                    <img src="assets/img/farmer.png"></img>
                                </figure>
                                <h3>Farm will available soon powered by <a target="_blank" href="https://github.com/b-u-i-d-l/unifi">UniFi V2</a> General Purposes Contracts</h3>
                            </section>
                        </section>
                    </section>}
                {this.state && this.state.toggle === 'code' && <section className="collectionPageItemsCode">
                    <section>
                        {this.props.collection.extensionCode && <section className="CodePART">
                            <h3>Extension</h3>
                            <Editor readonly firstCode={this.props.collection.extensionCode} />
                        </section>}
                        {this.props.collection.modelCode && <section className="CodePART">
                            <h3>Model</h3>
                            <Editor readonly firstCode={this.props.collection.modelCode} />
                        </section>}
                    </section>
                </section>}
            </section>
        </section>);
    }
});