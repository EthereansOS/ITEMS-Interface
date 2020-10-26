var MenuController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        var menu = await window.AJAXRequest('data/menu.json');
        var selected = 0;
        var section = context.onSection();
        try {
            selected = menu.indexOf(menu.filter(it => section ? it.module === section : it.selected)[0]);
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

    context.onSection = function onSection() {
        var section = window.consumeAddressBarParam("section");
        if(window.context.domainData && window.location.hostname.indexOf(window.context.domainData.name) !== -1) {
            section = window.location.hostname.split('.')[0];
            section = window.context.domainData.sections[section];
        }
        return section;
    };
};