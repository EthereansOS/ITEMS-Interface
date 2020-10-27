var Collection = React.createClass({
    requiredModules : [
        'spa/singleCollection',
        'spa/collectionSingleItem'
    ],
    toggle(e) {
        window.preventItem(e);
        var oldToggle = this.state && this.state.toggle;
        var toggle = e.currentTarget.innerHTML.toLowerCase();
        toggle = oldToggle === toggle ? null : toggle;
        this.setState({toggle});
    },
    onCollectionObjectIds(collectionObjectIds) {
        this.props.collection.items = this.props.collection.items || {};
        this.setState({collectionObjectIds});
    },
    render() {
        return (<section className="Pager">
            <section className="collectionPage">
                <SingleCollection collection={this.props.collection} className="collectionPageInfo" showLink showItemsCount  onCollectionObjectIds={this.onCollectionObjectIds}/>
                <section className="collectionNav">
                    <ul>
                        <li className={this.state && this.state.toggle === 'items' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle}>Items</a></li>
                        <li className={this.state && this.state.toggle === 'farm' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle}>Farm</a></li>
                        {this.props.collection.code && <li className={this.state && this.state.toggle === 'code' ? 'selected' : undefined}><a href="javascript:;" onClick={this.toggle}>Code</a></li>}
                    </ul>
                </section>
                {this.state && this.state.toggle === 'items' && <section className="collectionPageItems">
                    <section className="collectionPageItemsOrder">
                        {!this.state.collectionObjectIds && <Loader/>}
                        {this.state.collectionObjectIds.map(it => <CollectionSingleItem key={it} objectId={it} collection={this.props.collection}/>)}
                    </section>
                </section>}
                {this.state && this.state.toggle === 'farm' && <section className="collectionPageItemsFarm">
                    Soon @ UniFi
                </section>}
                {this.state && this.state.toggle === 'code' && <section className="collectionPageItemsCode">
                    Code
                </section>}
            </section>
        </section>);
    }
});