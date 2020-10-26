var Explore = React.createClass({
    requiredScripts : [
        'spa/loader.jsx',
        'spa/explore/collectionItem.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/ping' : this.controller.refreshUserData,
            'ethereum/update' : this.controller.loadData
        }
    },
    componentDidMount() {
        this.controller.loadData();
    },
    render() {
        return(
        <section className="Pager">
            <section className="collections">
                <CollectionItem/>
            </section>
        </section>);
    }
});