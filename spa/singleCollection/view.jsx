var SingleCollection = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh" : () => this.controller.loadData(this)
        }
    },
    componentDidMount() {
        this.controller.loadData(this);
    },
    render() {
        return (<section className={this.props.className || "collection"}>
            {!this.props.collection.loaded && <Loader />}
            {this.props.collection.loaded && this.props.collection.image && <figure className="collectionIcon">
                <img src={this.props.collection.image} />
            </figure>}
            {this.props.collection.loaded && <article className="collectionInfo">
                <h3 className="collectionTitle" className="BrandizedS">{this.props.collection.name}</h3>
                <p className="collectionDesc">{!this.props.collection.collection_description ? "No description available" : window.shortenWord(this.props.collection.collection_description)}</p>
                {this.props.showItemsCount && <span className="collectionItems">
                    {(!this.state || (this.state.itemsCount !== 0 && !this.state.itemsCount)) && <InnerLoader/>}
                    {this.state && this.state.itemsCount > 0 && `${this.state.itemsCount} ITEMS`}
                </span>}
                {this.props.showLink && <span className="collectionLink">wimd.item.eth.link</span>}
            </article>}
        </section>);
    }
});