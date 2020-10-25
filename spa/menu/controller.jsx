var MenuController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        var menu = await window.AJAXRequest('data/menu.json');
        var selected = 0;
        try {
            selected = menu.indexOf(menu.filter(it => it.selected)[0]);
        } catch(e) {
        }
        context.view.setState({menu, selected}, function() {
            context.view.onSelection({
                currentTarget : {
                    dataset : {
                        index : selected
                    }
                }
            });
        });
    };
};