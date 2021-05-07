var LazyImageLoader = React.createClass({
    onLoad() {
        this.loader && (this.loader.style.display = "none");
        this.image && (this.image.style.display = "inline-block");
    },
    onError() {
        this.loader && (this.loader.style.display = "none");
        this.errorMessage && (this.errorMessage.style.display = "inline-block");
    },
    render() {
        var src = this.props.src;
        src = window.formatLink(src);
        if(src.startsWith("//data")) {
            src = src.substring(2);
        }
        return (<section>
            <section className="LoadImg" ref={ref => this.loader = ref}><img src="assets/img/loadMonolith.png"></img></section>
            <img src={src} ref={ref => this.image = ref} style={{display : "none"}} onLoad={this.onLoad} onError={this.onError}/>
            <p ref={ref => this.errorMessage = ref} style={{display : "none"}}>An error occurred while trying to load <a href={window.formatLink(src)} target="_blank">this image</a></p>
        </section>);
    }
});