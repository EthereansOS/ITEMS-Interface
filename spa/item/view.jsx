var Item = React.createClass({
    render() {
        return(
        <section className="Pager">
            <section className="collectionPage">
                <section className="collectionPageInfo">
                    <figure className="collectionIcon">
                        <img></img>
                    </figure>
                    <article className="collectionInfo">
                        <h3 className="collectionTitle" className="BrandizedS">Collection Name</h3>
                        <p className="collectionDesc">Collection Description Collection Description Collection Description Collection Description Collection Description Collection Description Collection Description Collection Description Collection Description v Collection Description Collection Description Collection Description Collection Description Collection Description Collection Description</p>
                        <span className="collectionItems">3 ITEMS</span>
                    </article>
                </section>
                <section className="collectionPageItems">
                    <section className="collectionPageItem">
                        <a>
                            <figure className="ItemIcon">
                                <img></img>
                            </figure>
                        </a>
                    <article className="ItemInfo">
                        <h3 className="ItemTitle" className="BrandizedS">Item Name</h3>
                        <a className="ItemPrice">&#129412; Price: $20</a>
                        <a className="ItemPrice">&#9973; Price: $20</a>
                        <span className="ItemSupply">Quantity: 300,000</span>
                        <a className="ItemCollectionLink">Collection: WIMD</a>
                    </article>
                    </section>
                </section>
            </section>
        </section>);
    }
});