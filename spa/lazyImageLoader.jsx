var LazyImageLoader = React.createClass({
    render() {
        return (<section>
            <section ref={ref => this.loader = ref}>Loading</section>
            <img src={this.props.src} onLoad={() => this.loader && (this.loader.style.display = "none")}/>
        </section>);
    }
});