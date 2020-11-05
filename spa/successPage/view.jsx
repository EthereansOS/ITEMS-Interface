var SuccessPage = React.createClass({
    render() {
        return (<section className="Pager yeahPage">
            {/* After creating a Collection */}
            <section className="AllDoneBro">
                <h2>*Nome* is now a real thing!</h2>
                <figure>
                    <img></img>
                </figure>
                <p>Spread the word using this link <a></a></p>
                <h2>And now?</h2>
                <a className="Enter">Create the first Item</a>
                <p><a>Go to the Collection page</a></p>
            </section>
            {/* After creating an ITEM */}
            <section className="AllDoneBro">
                <h2>You have successfully created this amazing new ITEM!</h2>
                <figure>
                    <img></img>
                </figure>
                <p>Spread the word using this link <a></a></p>
                <h2>And now?</h2>
                <a className="Enter">Create another Item</a>
                <p><a>Go to the ITEM page</a></p>
            </section>
            {/* After wrapping an ITEM */}
            <section className="AllDoneBro">
                <h2>You have successfully wrapped *Quantity* *Nome*</h2>
                <h2>And now?</h2>
                <a className="Enter">Wrap another Item</a>
                <p><a>Go to the ITEM page</a></p>
            </section>
        </section>);
    }
});