var Index = React.createClass({
    requiredModules : [
        'spa/menu'
    ],
    sectionChange(module, props) {
        var _this = this;
        var section = module.split('/');
        section = section[section.length - 1].firstLetterToUpperCase();
        ReactModuleLoader.load({
            modules: [module],
            callback: () => _this.setState({section, props})
        });
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        props.props && Object.entries(props.props).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        return (<section>
            <section>
                <Menu onSelection={this.sectionChange}/>
            </section>
            {props.section && <section>
                {React.createElement(window[props.section], props)}
            </section>}
        </section>);
    }
});