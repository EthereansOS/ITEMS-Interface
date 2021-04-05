var Farm = React.createClass({
    requiredScripts: [
        "spa/farmComponents/farmViewer.jsx"
    ],
    componentDidMount() {
        window.setHomepageLink(`?section=farm`);
    },
    render() {
        return (<section>
            <section>
                <br/>
                <br/>
                <br/>
            </section>
            <FarmViewer/>
        </section>);
    }
});