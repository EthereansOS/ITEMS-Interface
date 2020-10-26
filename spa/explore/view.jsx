var Explore = React.createClass({
    requiredScripts : [
        'spa/loader.jsx',
        'spa/explore/collectionItem.jsx'
    ],
    render() {
        return(
        <section className="Pager">
            <section className="collections">
                <CollectionItem/>
            </section>
        </section>);
    }
});