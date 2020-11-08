var Farm = React.createClass({
    componentDidMount() {
        window.setHomepageLink(`?section=farm`);
    },
    render() {
        return (<section>
            <section className="SoonFARM">
                <figure className="FarmImg">
                    <img src="assets/img/farmer.png"></img>
                </figure>
                <h3>Farm will available soon powered by <a target="_blank" href="https://github.com/b-u-i-d-l/unifi">UniFi V2</a> General Purposes Contracts</h3>
            </section>
        </section>);
    }
});