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
            <section>
                <a href={window.context.createFarmingContractURLTemplate.format("")} target="_blank">New Farming Contract</a>
            </section>
            <FarmViewer/>
        </section>);
    }
});