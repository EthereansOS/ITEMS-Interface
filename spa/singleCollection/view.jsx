var SingleCollection = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx',
        "spa/lazyImageLoader.jsx"
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
        var color = this.props.collection.backgroundImage;
        return (<section className={this.props.className || "collection"}>
            {!this.props.collection.loaded && <Loader />}
            {this.props.collection.loaded && this.props.collection.image && <figure className="collectionIcon" style={{"background-color" : color}}>
                <LazyImageLoader src={this.props.collection.image} />
            </figure>}
            {this.props.collection.loaded && <article className="collectionInfo">
                <h3 className="collectionTitle" style={{color}}>{this.props.collection.name} <span>({this.props.collection.symbol})</span></h3>
                <p className="collectionDesc">{!this.props.collection.collection_description ? "No description available" : window.shortenWord(this.props.collection.collection_description)}</p>
                {this.props.showItemsCount && <span className="collectionItems BrandizedS">
                    {(!this.state || (this.state.itemsCount !== 0 && !this.state.itemsCount)) && <InnerLoader/>}
                    {this.state && this.state.itemsCount > 0 && `${this.state.itemsCount} ITEMS`}
                </span>}
                {this.props.showLink && <span className="collectionLink">https://wimd.item.eth.link</span>}
            </article>}
        </section>);
    }
});