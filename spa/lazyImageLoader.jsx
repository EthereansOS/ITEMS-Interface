var LazyImageLoader = React.createClass({
    onLoad() {
        this.loader && (this.loader.style.display = "none");
        this.image && (this.image.style.display = "inline-block");
    },
    render() {
        return (<section>
            <section className="LoadImg" ref={ref => this.loader = ref}><img src="assets/img/loadMonolith.png"></img></section>
            <img src={window.formatLink(this.props.src)} ref={ref => this.image = ref} style={{display : "none"}} onLoad={this.onLoad}/>
        </section>);
    }
});