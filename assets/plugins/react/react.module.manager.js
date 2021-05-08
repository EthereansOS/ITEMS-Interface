var ReactModuleManager = function() {
    var createElementInternal = function(data) {
        if (window.controllerPool === undefined) {
            window.controllerPool = {}
        }

        if (window.loadedModules === undefined) {
            window.loadedModules = {}
        }

        var viewName = data.viewName
        var createNew = data.createNew
        var callerArguments = data.arguments

        if (createNew === true) {
            delete window.loadedModules[viewName]
        }

        var elementName = undefined
        var reactClass = typeof viewName !== 'string' ? viewName : window[viewName] !== undefined ? window[viewName] : undefined

        if (reactClass !== undefined && reactClass.prototype && reactClass.prototype.constructor.displayName !== undefined) {
            elementName = reactClass.prototype.constructor.displayName
            if (reactClass.prototype.oldRender === undefined) {
                var requireCalled = true;
                if(reactClass.prototype.requiredModules || reactClass.prototype.requiredScripts) {
                    requireCalled = false;
                }
                reactClass.prototype.oldRender = reactClass.prototype.render
                reactClass.prototype.render = function render() {

                    this.oldRender.instance = this;

                    var viewName = this.constructor.displayName
                    if (this.props.newController === true) {
                        delete window.controllerPool[elementName]
                    }
                    if (window[viewName + 'Controller'] !== undefined && this.controller === undefined) {
                        if (window.controllerPool[viewName] === undefined || window.controllerPool[viewName] === null) {
                            window.controllerPool[viewName] = new window[viewName + 'Controller'](this)
                        }
                        this.controller = window.controllerPool[viewName]
                        this.controller.view = this
                    }
                    var rendered = null;
                    var loader = true;
                    if(requireCalled !== false) {
                        this.useStateCounter = 0;
                        this.rendering = true;
                        loader = false;
                        try {
                            rendered = this.oldRender.apply(this);
                            !this.useEffectEnd && this.useEffectCallbacks && this.useEffectCallbacks.all && this.useEffectCallbacks.all.forEach(it => setTimeout(it));
                            this.useEffectEnd = true;
                        } catch(e) {
                            delete this.useEffectCallbacks;
                            if(requireCalled === "true") {
                                console.error(e);
                                rendered = this.componentDidCatch.apply(this, [e]) || React.createElement('span', {});
                            } else {
                                loader = true;
                                requireCalled = false;
                            }
                        }
                        delete this.rendering;
                    }
                    if(requireCalled === false) {
                        if(this.getCustomLoader) {
                            rendered = this.getCustomLoader();
                        } else if(React.globalLoader) {
                            rendered = React.globalLoader();
                        } else {
                            rendered = React.defaultLoader();
                        }
                        try {
                            if(rendered.type.displayName) {
                                var props = {};
                                rendered.props && Object.keys(rendered.props).map(key => props[key] = rendered.props[key]);
                                var children = props.children;
                                delete props.children;
                                rendered = ReactModuleManager.createElementNew(rendered.type.displayName, props, children);
                            }
                        } catch(e) {
                        }
                        ReactModuleLoader.load({
                            modules: this.requiredModules,
                            scripts: this.requiredScripts,
                            callback: function() {
                              Object.keys(window).filter(key => key.indexOf('_') === 0 && window[key.substring(1)] && window[key] && !window[key].default).forEach(key => (window[key] = window[key] || {}).default = window[key.substring(1)]);
                              requireCalled = 'true';
                              var _this = this;
                              this.forceUpdate(function() {
                                requireCalled = true;
                                _this.extensionsLoaded && _this.extensionsLoaded.apply(_this);
                                _this.componentDidMount && _this.componentDidMount.apply(_this);
                              });
                            }.bind(this)
                        });
                    }

                    this.oldRef = rendered.ref && rendered.ref.name.indexOf("generatedRef") === -1 ? rendered.ref : null;

                    rendered.ref = function generatedRef(ref) {
                        this.domRoot = $(ref);
                        ref && ref.domRoot && (this.domRoot = ref.domRoot);
                        this.domRoot && this.domRoot[0] && (this.domRoot[0].reactInstance = this);
                        this.domRoot && this.domRoot[0] && this.parentClass && (this.domRoot.parent()[0].className = this.parentClass);
                        if (this.oldRef !== undefined && this.oldRef !== null) {
                            this.oldRef.apply(this, [ref]);
                        }
                    }.bind(this)

                    var lowerCaseViewName = viewName.substring(0, 1).toLowerCase() + viewName.substring(1);
                    if (rendered.props === undefined || rendered.props === null) {
                        rendered.props = {};
                    }
                    rendered.props.className = loader ? rendered.props.defaultClassName : rendered.props.className;
                    if (rendered.props.className === undefined || rendered.props.className === null) {
                        rendered.props.className = '';
                    }
                    if(rendered.props.className) {
                        if (!rendered.props.className.containsAloneWord(lowerCaseViewName)) {
                            if (rendered.props.className !== '') {
                                lowerCaseViewName += ' '
                            }
                            rendered.props.className = lowerCaseViewName + rendered.props.className;
                        }
                    }
                    return rendered
                }
            }

            reactClass.prototype.useState = reactClass.prototype.useState || function useState(initialValue) {
                if(!this.rendering) {
                    throw "Cannot call useState while not rendering";
                }
                this.useStateVars = this.useStateVars || [];
                if(this.useStateVars.length <= this.useStateCounter) {
                    var index = this.useStateCounter;
                    var _this = this;
                    this.useStateVars.push([initialValue, function setUseStateVarValue(newValue) {
                        _this.setUseStateVarValue(index, newValue);
                    }]);
                }
                return this.useStateVars[this.useStateCounter++];
            };

            reactClass.prototype.setUseStateVarValue = reactClass.prototype.setUseStateVarValue || function setUseStateVarValue(varIndex, varValue) {
                var _this = this;
                _this.setUseStateVarValuesTimeout && clearTimeout(_this.setUseStateVarValuesTimeout);
                _this.useStateVarNewValues = _this.useStateVarNewValues || {};
                _this.useStateVarNewValues[varIndex] = varValue;
                _this.setUseStateVarValuesTimeout = setTimeout(function() {
                    var newState = _this.useStateVarNewValues;
                    delete _this.useStateVarNewValues;
                    var callbacks = [];
                    _this.useEffectCallbacks && Object.keys(newState).forEach(it => !(newState[it] == _this.useStateVars[it][0]) && callbacks.push(..._this.useEffectCallbacks[it]));
                    _this.useEffectCallbacks && callbacks.push(...(_this.useEffectCallbacks["update"] || []));
                    callbacks = callbacks.sort(function(a, b) {
                        var first = _this.useEffectCallbacks.all.indexOf(a);
                        var second = _this.useEffectCallbacks.all.indexOf(b);
                        return first < second ? -1 : first > second ? 1 : 0;
                    });
                    Object.entries(newState).forEach(it => _this.useStateVars[it[0]][0] = it[1]);
                    _this.forceUpdate(function() {
                        callbacks.filter((it, i) => it && callbacks.indexOf(it) === i).forEach(it => setTimeout(it));
                    });
                }, 10);
            };

            reactClass.prototype.useEffect = reactClass.prototype.useEffect || function useEffect(callback, vars) {
                if(!this.useEffect) {
                    throw "Cannot call useEffect while not rendering";
                }
                var _this = this;
                if(_this.useEffectEnd) {
                    return;
                }
                (_this.useEffectCallbacks = _this.useEffectCallbacks || {all : []}).all.push(callback = callback.bind(this));
                if(!vars) {
                    return (_this.useEffectCallbacks["update"] = _this.useEffectCallbacks["update"] || []).push(callback);
                }
                for(var value of vars) {
                    var index = _this.useStateVars.indexOf(_this.useStateVars.filter(it => it[0] == value)[0]);
                    (_this.useEffectCallbacks[index] = _this.useEffectCallbacks[index] || []).push(callback);
                }
            };

            if (reactClass.prototype._internalDomRefresh === undefined) {
                reactClass.prototype._internalDomRefresh = function _internalDomRefresh() {
                    if (this.domRoot !== undefined && this.domRoot !== null && this.domRoot.length > 0) {
                        React.domRefresh && React.domRefresh(this.domRoot)
                    }
                }
            }

            if (reactClass.prototype.oldComponentDidUpdate === undefined) {
                reactClass.prototype.oldComponentDidUpdate = reactClass.prototype.componentDidUpdate
                reactClass.prototype.componentDidUpdate = function componentDidUpdate() {
                    if(requireCalled !== true) {
                        return;
                    }
                    this._internalDomRefresh.apply(this);
                    if (this.oldComponentDidUpdate !== undefined && this.oldComponentDidUpdate !== null) {
                        this.oldComponentDidUpdate.apply(this);
                    }
                }
            }

            if (reactClass.prototype.oldComponentDidMount === undefined) {
                reactClass.prototype.oldComponentDidMount = reactClass.prototype.componentDidMount
                reactClass.prototype.componentDidMount = function componentDidMount() {
                    this.mounted = true;
                    if(requireCalled === false) {
                        return;
                    }
                    if(this.subscribe) {
                        var defaultSubscriptions = (this.getDefaultSubscriptions && this.getDefaultSubscriptions.apply(this)) || null;
                        var _this = this;
                        if(defaultSubscriptions) {
                            Object.keys(defaultSubscriptions).map(function(it) {
                                _this.subscribe(it, defaultSubscriptions[it]);
                            });
                        }
                    }
                    this._internalDomRefresh.apply(this);
                    if (this.oldComponentDidMount !== undefined && this.oldComponentDidMount !== null) {
                        this.oldComponentDidMount.apply(this);
                    }
                }
            }
            if (reactClass.prototype.enqueue === undefined) {
                reactClass.prototype.enqueue = function enqueue(func, timeout) {
                    !timeout && (timeout = 250)
                    return setTimeout(function() {
                        func.bind(this).apply(this)
                    }.bind(this), timeout)
                }
            }
            if (reactClass.prototype.dequeue === undefined) {
                reactClass.prototype.dequeue = function dequeue(queueElementId) {
                    cancelTimeout(queueElementId);
                }
            }
            if (typeof jQuery !== 'undefined' && jQuery.publish) {
                if (reactClass.prototype.oldComponentWillUnmount === undefined) {
                    reactClass.prototype.oldComponentWillUnmount = reactClass.prototype.componentWillUnmount
                    reactClass.prototype.componentWillUnmount = function componentWillUnmount() {
                        this.unsubscribeAll();
                        if (this.oldComponentWillUnmount !== undefined && this.oldComponentWillUnmount !== null) {
                            this.oldComponentWillUnmount.apply(this);
                        }
                        delete this.mounted;
                    }
                }
                if (reactClass.prototype.subscribe === undefined) {
                    reactClass.prototype.subscribe = function subscribe(eventAddress, func) {
                        if (this.events === undefined || this.events === null) {
                            this.events = {}
                        }
                        if (this.events[eventAddress]) {
                            return;
                        }
                        $.subscribe(eventAddress, this.events[eventAddress] = function callback() {
                            var args = [];
                            for (var i = 1; i < arguments.length; i++) {
                                args.push(arguments[i]);
                            }
                            func.bind(this).apply(this, args)
                        }.bind(this))
                    }
                }
                if (reactClass.prototype.unsubscribe === undefined) {
                    reactClass.prototype.unsubscribe = function unsubscribe(eventAddress) {
                        if (this.events === undefined || this.events === null || !this.events[eventAddress]) {
                            return
                        }
                        $.unsubscribe(eventAddress, this.events[eventAddress])
                        delete this.events[eventAddress]
                    }
                }
                if (reactClass.prototype.unsubscribeAll === undefined) {
                    reactClass.prototype.unsubscribeAll = function unsubscribeAll() {
                        if (this.events === undefined || this.events === null) {
                            return
                        }
                        for (var i in this.events) {
                            $.unsubscribe(i, this.events[i])
                        }
                        delete this.events
                    }
                }
                if (reactClass.prototype.emit === undefined) {
                    reactClass.prototype.emit = function emit() {
                        var args = [arguments[0], []];
                        for(var i = 1; i < arguments.length; i++) {
                            args[1].push(arguments[i]);
                        } 
                        $.publish.apply($, args);
                    }
                }
                if(reactClass.prototype.componentDidCatch === undefined) {
                    reactClass.prototype.componentDidCatch = function componentDidCatch(error, info) {
                        var element = (React.globalCatcher || React.defaultCatcher)(error, info);
                        ReactDOM.unmountComponentAtNode(React.domRoot || document.body);
                        ReactDOM.render(element, React.domRoot || document.body);
                    }
                }
            }
        }

        var element;
        var involveLoadedModules = true

        if (typeof viewName === 'symbol' || typeof viewName !== 'string' || window[viewName] === undefined) {
            element = React.createElement2.apply(React, callerArguments)
            involveLoadedModules = typeof viewName !== 'string'
            if (elementName !== undefined) {
                viewName = elementName
            }
        } else if (window.loadedModules[viewName] !== undefined) {
            element = window.loadedModules[viewName]
        } else {
            callerArguments[0] = window[viewName];
            element = React.createElement2.apply(React, callerArguments)
        }

        if (involveLoadedModules === true && window.loadedModules[viewName] === undefined) {
            window.loadedModules[viewName] = element
        }

        (typeof viewName).toLowerCase() === 'string' && (window['_' + viewName] = { default : window[viewName] });

        return element
    }
    return {
        createElement: function(viewName) {
            return createElementInternal({
                viewName,
                arguments: arguments
            })
        },
        createElementNew: function(viewName) {
            return createElementInternal({
                viewName,
                createNew: true,
                arguments: arguments
            })
        }
    }
}()
React.defaultLoader = function() {
    return React.createElement('span', {}, 'Loading...');
};
React.defaultCatcher = function(e) {
    return React.createElement('h1', {}, 'An error occurred during rendering: "' + (e.message || e) + '".\nPlease try refresh the page.');
};
window.useState = function useState() {
    var context = window.useState.caller.instance || React;
    return context.useState.apply(context, arguments);
}
window.useEffect = function useEffect() {
    var context = window.useEffect.caller.instance || React;
    return context.useEffect.apply(context, arguments);
}
window.Fragment = React.Fragment;
React.createElement2 = React.createElement;
React.createElement = ReactModuleManager.createElement
createReactClass && (React.createClass = createReactClass)