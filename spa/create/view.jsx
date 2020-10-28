var Create = React.createClass({
    render() {
        return(
        <section className="Pager">
            <section className="createPage">
                <section className="createStart">
                    <h2>What do you want to do?</h2>
                    <a>Create a new Collection</a>
                    <a>Create a new ITEM</a>
                </section>


                <section className="createITEM">
                    <section className="FormCreateThing">
                        <h2>Collection:</h2>
                        <select></select>
                    </section>
                    <section className="FormCreateThing">
                            <a className="SuperActionBTN">NEXT</a>
                    </section>
                </section>


                <section className="createITEM">
                    <h2>Let's start from the basics</h2>
                    <section className="FormCreate">
                        <section className="FormCreateThing">
                            <p>Name</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>Symbol</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>Supply</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>You'll maintain the right to mint new?</p>
                            <label>
                                <span>Yes</span>
                                <input type="radio" name="maintainMintRight" value="true"/>
                            </label>
                            <label>
                                <span>No</span>
                                <input type="radio" name="maintainMintRight" value="false"/>
                            </label>
                        </section>
                        <section className="FormCreateThing">
                            <a className="SuperActionBTN">NEXT</a>
                        </section>
                    </section>
                </section>


                <section className="createITEM">
                    <h2>Now it's time to add some info</h2>
                    <section className="FormCreate">
                        <section className="FormCreateThing">
                            <p>Metadata Link</p>
                            <input></input>
                            <span>The metadata file is a Json standard file containing all of the info and links to the file of the ITEM. <a>here</a> You can find a step by step guide to build your json file correctly.</span>
                        </section>
                        <section className="FormCreateThing">
                            <a className="SuperActionBTN">DEPLOY</a>
                        </section>
                    </section>
                </section>


                <section className="createCollection">
                    <h2>Let's start from the basics</h2>
                    <section className="FormCreate">
                        <section className="FormCreateThing">
                            <p>Name</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>Symbol</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>Description</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <p>ENS</p>
                            <input></input>
                        </section>
                        <section className="FormCreateThing">
                            <a className="SuperActionBTN">NEXT</a>
                        </section>
                    </section>
                </section>


                <section className="createCollection">
                    <h2>Who is the owner?</h2>
                    <section className="FormCreate">
                        <section className="FormCreateThing">
                            <select></select>
                        </section>
                        <section className="FormCreateThing">
                            <a>Anyone</a>
                        </section>
                        <section className="FormCreateThing">
                            <a>Contract</a>
                        </section>
                    </section>
                    <section className="FormCreateThing">
                    <span>The owner of the collection is who have the ability to mint ITEMS, it can be anyone, an address or you can extend it with custom rules via deploying an extension conctract. More info <a>Here</a></span>
                            <a className="SuperActionBTN">DEPLOY</a>
                    </section>
                </section>
            </section>
        </section>);
    }
});