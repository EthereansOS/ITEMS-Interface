var ReactModuleLoader = function() {
    var ReactModuleLoaderInternal = function(data) {
        var context = this;
        context.rawData = data;

        context.init = function() {
            if (context.rawData === undefined || context.rawData === null || context.rawData === '' || context.rawData.length === 0) {
                return
            }
            var modules = [];
            var scripts = [];
            if (typeof context.rawData === 'string' || typeof context.rawData === 'String') {
                modules.push(context.rawData)
            } else if (typeof context.rawData.length !== 'undefined' && context.rawData.length > 0) {
                for (var i in context.rawData) {
                    modules.push(context.rawData[i])
                }
            } else {
                if (typeof context.rawData.module === 'string' || typeof context.rawData.module === 'String') {
                    modules.push(context.rawData.module)
                } else if (typeof context.rawData.modules !== 'undefined' && typeof context.rawData.modules.length !== 'undefined' && context.rawData.modules.length > 0) {
                    for (var i in context.rawData.modules) {
                        modules.push(context.rawData.modules[i])
                    }
                }

                if (typeof context.rawData.script === 'string' || typeof context.rawData.script === 'String') {
                    scripts.push(context.rawData.script)
                } else if (typeof context.rawData.scripts !== 'undefined' && typeof context.rawData.scripts.length !== 'undefined' && context.rawData.scripts.length > 0) {
                    for (var i in context.rawData.scripts) {
                        scripts.push(context.rawData.scripts[i])
                    }
                }
            }
            for (var i in modules) {
                var module = modules[i];
                if (module.indexOf('.jsx') !== -1 ||
                    module.indexOf('.js') !== -1 ||
                    module.indexOf('.css') !== -1 ||
                    module.indexOf('.scss') !== -1) {
                    scripts.unshift(module);
                    continue;
                }
                if (module.lastIndexOf('/') !== module.length - 1) {
                    module += '/';
                }
                scripts.unshift(module + 'style.min.css', module + 'view.jsx', module + 'controller.jsx');
            }

            if (typeof context.rawData === 'string' ||
                typeof context.rawData === 'String' ||
                (typeof context.rawData.length !== undefined && context.rawData.length > 0)) {
                context.rawData = scripts;
            } else {
                delete context.rawData.script;
                delete context.rawData.scripts;
                delete context.rawData.module;
                delete context.rawData.modules;
                context.rawData.scripts = scripts;
            }
            ScriptLoader.load(context.rawData);
        }();
    };

    return {
        load: function(data) {
            new ReactModuleLoaderInternal(data)
        }
    };
}();