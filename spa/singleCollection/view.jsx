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
    getCustomLoader() {
        return (<section className={"singleCollection" + (this.props.className || "collection")}>
            <figure className="collectionIcon">
                <img src="assets/img/loadMonolith.png"/>
            </figure>
            <article className="collectionInfo">
                <h3 className="collectionTitle">{'\u00a0'}<span>{'\u00a0'}</span></h3>
            </article>
        </section>);
    },
    renderCollectionProblems(problems) {
        return (<p>
            <h4>Some error where found in this collection:</h4>
            {problems.map(it => <span>{it}</span>)}
        </p>);
    },
    render() {
        var color = this.props.collection.background_color;
        var children = [<Loader />];
        if (this.props.collection.loaded) {
            children = [
                <figure className="collectionIcon">
                    {(this.props.collection.metadata || this.props.collection.category !== 'ERC1155') && <LazyImageLoader src={window.getElementImage(this.props.collection)}/>}
                    {this.props.collection.isOwner && <h6>Owner</h6>}
                </figure>,
                <article className="collectionInfo">
                    {!this.props.miniature && <h3 className="collectionTitle">{this.props.collection.name} <span>({this.props.collection.symbol})</span></h3>}
                    {this.props.miniature && <h3 className="collectionTitle">{window.shortenWord(this.props.collection.name, 25)} <span>({window.shortenWord(this.props.collection.symbol, 6)})</span></h3>}
                    {!this.props.miniature && window.renderExpandibleElement(!this.props.collection.description ? "No description available" : window.convertTextWithLinksInHTML(this.props.collection.description), <p className="collectionDesc" />)}
                    {this.props.miniature && <p className="collectionDesc">{!this.props.collection.description ? "No description available" : window.shortenWord(this.props.collection.description, 100)}</p>}
                    {!this.props.miniature && this.props.collection.problems && this.props.collection.problems.length > 0 && this.renderCollectionProblems(this.props.collection.problems)}
                    {this.props.showItemsCount && <span className="collectionItems BrandizedS">
                        {(!this.state || (this.state.itemsCount !== 0 && !this.state.itemsCount)) && <InnerLoader />}
                        {this.state && this.state.itemsCount > 0 && `${this.state.itemsCount} ITEMS`}
                    </span>}
                    {this.props.collection.ens && this.props.showLink && <a target="_blank" href={`https://${this.props.collection.ens}.link`} className="collectionLink">{this.props.collection.ens}</a>}
                    {this.props.collection.external_url && this.props.showLink && <a target="_blank" href={window.formatLink(this.props.collection.external_url)} className="collectionLink">{window.formatLinkForExpose(this.props.collection.external_url)}</a>}
                </article>
            ];
        }
        if (this.props.onClick) {
            children = (<a href="javascript:;" data-key={this.props.collectionKey} onClick={this.props.onClick}>
                {children}
            </a>);
        }
        return (<section className={this.props.className || "collection"}>
            {children}
        </section>);
    }
});