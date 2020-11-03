var SingleCollection = React.createClass({
    requiredScripts: [
        'spa/loader.jsx',
        'spa/innerLoader.jsx',
        "spa/lazyImageLoader.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            "collections/refresh": () => this.controller.loadData(this)
        }
    },
    componentDidMount() {
        this.controller.loadData(this);
    },
    render() {
        var color = this.props.collection.background_color;
        var children = [<Loader />];
        if (this.props.collection.loaded) {
            children = [
                <figure className="collectionIcon" style={{ "background-color": color }}>
                    {this.props.collection.image && <LazyImageLoader src={this.props.collection.image}/>}
                    {/*this.props.collection.isOwner && */<h6>Owner</h6>}
                </figure>,
                <article className="collectionInfo">
                    <h3 className="collectionTitle" style={{ color }}>{window.shortenWord(this.props.collection.name, 25)} <span>({window.shortenWord(this.props.collection.symbol, 6)})</span></h3>
                    {/*this.props.collection.isOwner && */<h6>I am the owner</h6>}
                    {window.renderExpandibleElement(!this.props.collection.description ? "No description available" : window.convertTextWithLinksInHTML(this.props.collection.description), <p className="collectionDesc" />)}
                    {this.props.showItemsCount && <span className="collectionItems BrandizedS">
                        {(!this.state || (this.state.itemsCount !== 0 && !this.state.itemsCount)) && <InnerLoader />}
                        {this.state && this.state.itemsCount > 0 && `${this.state.itemsCount} ITEMS`}
                    </span>}
                    {this.props.collection.ens && this.props.showLink && <a target="_blank" href={`https://${this.props.collection.ens}.link`} className="collectionLink">{this.props.collection.ens}</a>}
                    {this.props.collection.external_url && this.props.showLink && <a target="_blank" href={window.formatLink(this.props.collection.external_url)} className="collectionLink">{window.formatLinkForExpose(this.props.collection.external_url)}</a>}
                </article>
            ];
        }
        if(this.props.onClick) {
            children = (<a href="javascript:;" data-index={this.props.index} onClick={this.props.onClick}>
                {children}
            </a>);
        }
        return (<section className={this.props.className || "collection"}>
            {children}
        </section>);
    }
});