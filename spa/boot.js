function Boot() {
    getPage();
    var pathName = 'index';
    var props = {};
    var callback = undefined;
    for(var i in arguments) {
        var arg = arguments[i];
        if(typeof arg === 'string') {
            pathName = arg;
        }
        if(typeof arg === 'object') {
            props = arg;
        }
        if(typeof arg === 'function') {
            callback = arg;
        }
    }
    ReactModuleLoader.load({
        modules: ['spa/' + pathName],
        callback : function() {
            ReactDOM.render(React.createElement(window[pathName.firstLetterToUpperCase()], props), document.body, callback);
        }
    });
};

function getPage() {
    var location;
    try {
        var search = {};
        var splits = window.location.search.split('?');
        for(var z in splits) {
            var split = splits[z].trim();
            if(split.length === 0) {
                continue;
            }
            split = split.split('&');
            for(var i in split) {
                var data = split[i].trim();
                if(data.length === 0) {
                    continue;
                }
                data = data.split('=');
                data[1] = window.decodeURIComponent(data[1]);
                if(!search[data[0]]) {
                    search[data[0]] = data[1];
                } else {
                    var value = search[data[0]];
                    if(typeof value !== 'object') {
                        value = [value];
                    }
                    value.push(data[1]);
                    search[data[0]] = value;
                }
            }
        }
        window.addressBarParams = search;
        location = window.addressBarParams.location;
    } catch(e) {
    }
    window.history.pushState({},"", window.location.protocol + '//' + window.location.host);
    return location;
};