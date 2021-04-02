function Link(props) {
    return <a target="_blank" href={props.href || window.context.covenantsURL + props.to} className={props.className}>{props.children}</a>
}