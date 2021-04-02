var ScriptLoader = function() {
    var ScriptLoaderInternal = function(data) {
        var context = this

        context.rawData = data

        context.m_js_files = []
        context.m_css_files = []
        context.m_head = document.getElementsByTagName('head')[0]
        context.m_scripts = document.getElementById('scripts-container')
        if (context.m_scripts === undefined || context.m_scripts === null) {
            context.m_scripts = context.m_head
        }
        context.baseURL = document.location.protocol + "//" + document.location.hostname
        if (!isNaN(document.location.port)) {
            context.baseURL += ":" + document.location.port
        }
        context.baseURL += "/"
        context.loadStyle = function() {
            if (context.m_css_files.length === 0) {
                context.loadScript()
                return
            }
            var styleToLoad = context.m_css_files[0]
            context.m_css_files.splice(0, 1)
            link = styleToLoad
            if (typeof link === 'string' || typeof link === 'String' || (link.href !== undefined && link.href !== null && link.href !== '')) {
                if (styleToLoad.href) {
                    styleToLoad = styleToLoad.href
                }
                link = document.createElement('link')
                link.rel = 'stylesheet'
                link.type = 'text/css'
                link.href = styleToLoad
                if (!context.canLoadStyle(link)) {
                    context.loadStyle()
                    return
                }
                link.href = context.withNoCache(styleToLoad)
            } else if (!context.canLoadStyle(link)) {
                context.loadStyle()
                return
            }

            link.onload = function() {
                context.log('Loaded style "' + styleToLoad + '".')
                if (window.stylesLoaded === undefined) {
                    window.stylesLoaded = []
                }
                if (styleToLoad !== undefined && styleToLoad !== null && styleToLoad !== '') {
                    window.stylesLoaded.push(styleToLoad.replace(context.baseURL, ""));
                }
                context.loadStyle()
            }
            link.onerror = function() {
                context.log('Error loading style "' + styleToLoad + '".')
                context.loadStyle()
            }
            context.log('Loading style ' + link.href)
            context.m_head.appendChild(link)
        }

        context.loadScript = function() {
            if (context.m_js_files.length === 0) {
                return context.tryCallback()
            }
            var scriptToLoad = context.m_js_files[0]
            context.m_js_files.splice(0, 1)
            var script = scriptToLoad
            if (typeof script === 'string' || typeof script === 'String' || (script.src !== undefined && script.src !== null && script.src !== '')) {
                if (script.src) {
                    scriptToLoad = script.src
                }
                script = document.createElement('script')
                script.type = 'text/javascript'
                script.src = scriptToLoad
                if (!context.canLoadScript(script)) {
                    context.loadScript()
                    return
                }
                script.src = context.withNoCache(scriptToLoad)
            } else if (!context.canLoadScript(script)) {
                context.loadScript()
                return
            }

            script.onload = function() {
                context.log('Loaded script "' + scriptToLoad + '".')
                if (window.scriptsLoaded === undefined) {
                    window.scriptsLoaded = []
                }
                if (scriptToLoad !== undefined && scriptToLoad !== null && scriptToLoad !== '') {
                    window.scriptsLoaded.push(scriptToLoad.replace(context.baseURL, ""))
                }
                context.loadScript()
            }
            script.onerror = function(e) {
                console.log(e)
                context.log('Error loading script "' + scriptToLoad + '".')
                context.loadScript()
            }
            context.log('Loading script "' + script.src + '".')
            if (script.type === 'text/babel' || context.contains(script.src, '.jsx')) {
                if (context.tryLoadBabelScript(script) !== false) {
                    return context.loadScript();
                }
                script.type = 'text/javascript'
            }
            if (script.src === undefined || script.src === null || script.src === '') {
                script.innerText += '\n//# sourceURL=gen_' + new Date().getTime() + '.jsx'
            }
            context.m_scripts.appendChild(script)
            if (script.src === undefined || script.src === null || script.src === '') {
                try {
                    eval(script.innerText)
                    context.log('Loaded script "' + scriptToLoad + '".')
                } catch (e) {
                    script.onerror(e)
                }
                context.loadScript()
            }
        }

        context.tryLoadBabelScript = function(script) {
            if (typeof Babel === 'undefined') {
                return false
            }
            ScriptLoader.babels = ScriptLoader.babels || {};
            context.babels = context.babels || {};
            ScriptLoader.babels[script.src] = ScriptLoader.babels[script.src] || new Promise(function(ok) {
                var location = script.src;
                var src = script.src || 'gen_' + new Date().getTime() + '.jsx';
                var babelTransform = function(code) {
                    var newScript = document.createElement('script')
                    newScript.type = 'text/javascript'
                    var transform = Babel.transform(code.split('<>').join('<React.Fragment>').split('</>').join('</React.Fragment>'), {
                        presets: ['es2015', 'es2015-loose', 'react', 'stage-0'],
                        sourceMaps: true
                    });
                    var evaluation = transform.code;
                    transform.map.file = src;
                    transform.map.sources[0] = src;
                    transform.map.sourcesContent[0] = transform.map.sourcesContent[0].split('<React.Fragment>').join('<>').split('</React.Fragment>').join('</>');
                    evaluation += '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + window.Base64.encode(JSON.stringify(transform.map));
                    newScript.src = 'data:text/javascript;charset=utf-8,' + escape(evaluation);
                    newScript.dataset.file = location;
                    newScript.onload = function() {
                        context.log('Loaded script "' + src + '".')
                        if (window.scriptsLoaded === undefined) {
                            window.scriptsLoaded = []
                        }
                        if (src !== undefined && src !== null && src !== '') {
                            window.scriptsLoaded.push(src.replace(context.baseURL, ""))
                        }
                        ok();
                    }
                    newScript.onerror = function(e) {
                        console.log(e)
                        context.log('Error loading script "' + src + '".')
                        ok();
                    }
                    context.m_scripts.appendChild(newScript);
                }
                if (src === undefined || src === null || src === '') {
                    babelTransform(script.innerText)
                } else {
                    context.xmlRequest(src, babelTransform)
                }
            });
            context.babels[script.src] = context.babels[script.src] || ScriptLoader.babels[script.src];
        }

        context.xmlRequest = function(src, callback) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest()
            } else {
                xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
            }
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200 || (xmlhttp.status == 0 && src.indexOf('file:///') !== -1)) {
                        callback(xmlhttp.responseText)
                        try {
                            xmlhttp.abort();
                        } catch (e) {
                            console.error(e);
                        }
                        return
                    }
                }
            }
            xmlhttp.open('GET', src + ('?' + (new Date().getTime() - 3) + '=' + (new Date().getTime() + 9)))
            xmlhttp.send()
        }

        context.canLoadScript = function(script) {
            var allScripts = document.getElementsByTagName('script')

            for (var i in allScripts) {
                var otherScript = allScripts[i]
                if (typeof otherScript !== 'object') {
                    continue
                }
                var found = false
                if (otherScript.src === undefined || otherScript.src === null || otherScript.src === '') {
                    found = (script.src === undefined ||
                            script.src === null ||
                            script.src === '') &&
                        otherScript.innerText.indexOf(script.innerText) !== -1
                } else {
                    found = (script.innerText === undefined ||
                            script.innerText === null ||
                            script.innerText === '') &&
                        (otherScript.src.indexOf(script.src) !== -1 || otherScript.src.indexOf(escape(script.src)) !== -1)
                }
                if (found === true) {
                    if (context.removeOld === true || context.removeOldScripts === true) {
                        otherScript.parentElement.removeChild(otherScript)
                        return true
                    }
                    return false
                }
            }
            if (window.scriptsLoaded === undefined) {
                window.scriptsLoaded = [script.src.replace(context.baseURL, "")]
                return true;
            }
            var found = undefined;
            for (var i in window.scriptsLoaded) {

                if (window.scriptsLoaded[i].replace(context.baseURL, "") === script.src.replace(context.baseURL, "")) {
                    found = i
                    break
                }
            }
            if (found !== undefined) {
                if (context.removeOld === true || context.removeOldStyles === true) {
                    window.scriptsLoaded.splice(found, 1)
                    return true
                }
                return false
            }
            return true
        }

        context.canLoadStyle = function(link) {
            var allStyles = []
            var links = document.getElementsByTagName('link')
            for (var i in links) {
                allStyles.push(links[i])
            }
            var styles = document.getElementsByTagName('style')
            for (var i in styles) {
                allStyles.push(styles[i])
            }
            for (var i in allStyles) {
                var otherStyle = allStyles[i]
                if (typeof otherStyle !== 'object') {
                    continue
                }
                var found = false
                if (otherStyle.href === undefined || otherStyle.href === null || otherStyle.href === '') {
                    found = (link.href === undefined ||
                            link.href === null ||
                            link.href === '') &&
                        otherStyle.innerText.indexOf(link.innerText) !== -1
                } else {
                    found = (link.innerText === undefined ||
                            link.innerText === null ||
                            link.innerText === '') &&
                        otherStyle.href.indexOf(link.href) !== -1
                }
                if (found === true) {
                    if (context.removeOld === true || context.removeOldStyles === true) {
                        otherStyle.parentElement.removeChild(otherStyle)
                        return true
                    }
                    return false
                }
            }
            if (window.stylesLoaded === undefined) {
                window.stylesLoaded = []
            }
            var found = undefined
            for (var i in window.stylesLoaded) {
                if (window.stylesLoaded[i].replace(context.baseURL, "") === link.href.replace(context.baseURL, "")) {
                    found = i
                    break
                }
            }
            if (found !== undefined) {
                if (context.removeOld === true || context.removeOldStyles === true) {
                    window.stylesLoaded.splice(found, 1)
                    return true
                }
                return false
            }
            return true
        }

        context.tryCallback = function() {
            if (context.m_js_files.length === 0 && context.m_css_files.length === 0 && context.callback) {
                if(!context.babels) {
                    return setTimeout(context.callback);
                }
                Promise.all(Object.values(context.babels)).then(context.callback);
            }
        }

        context.load = function() {
            if (context.scripts.length === 0) {
                return context.tryCallback();
            }
            for (var i = 0; i < context.scripts.length; ++i) {
                var script = context.scripts[i]
                try {
                    if (typeof script !== 'string' && typeof script !== 'String' && script.length) {
                        script = script[0]
                    }
                    if (script.localName === 'link' || script.localName === 'style' || context.contains(script, '.css')) {
                        context.m_css_files.push(script)
                    } else if (script.localName === 'script' || context.contains(script, '.js')) {
                        context.m_js_files.push(script)
                    } else
                        context.log('Error unknown filetype "' + script + '".')
                } catch (e) {
                    context.log(e)
                }
            }
            context.loadStyle()
        }

        context.endsWith = function(str, suffix) {
            if (str === null || suffix === null)
                return false
            try {
                return str.toLowerCase().indexOf(suffix.toLowerCase(), str.length - suffix.length) !== -1
            } catch (e) {
                return false
            }
        }

        context.contains = function(str, suffix) {
            if (str === null || suffix === null)
                return false
            try {
                return str.toLowerCase().indexOf(suffix.toLowerCase()) !== -1
            } catch (e) {
                return false
            }
        }

        context.withNoCache = function(filename) {
            if (context.noCache) {
                if (filename.indexOf('?') === -1)
                    filename += '?no_cache=' + new Date().getTime()
                else
                    filename += '&no_cache=' + new Date().getTime()
            }
            return filename
        }

        context.log = function(t) {
            // console.log("ScriptLoader: " + t)
        }
        
        context.removePreloaded = function(scripts) {
          if((typeof(window.preloadedScripts)).toLowerCase() === 'undefined') {
            return scripts;
          }
          if(scripts === undefined || scripts === null || scripts.length === 0) {
            return scripts;
          }
          var scpts = [];
          for(var i in scripts) {
            var script = scripts[i];
            var found = false;
            for(var j in window.preloadedScripts) {
              if(script === window.preloadedScripts[j]) {
                  found = true;
                  break;
              }
            }
            if(found === false) {
              scpts.push(script);
            }
          }
          return scpts;
        };

        context.init = function() {
                if (context.rawData === undefined || context.rawData === null || context.rawData === '' || context.rawData.length === 0) {
                    return
                }
                context.scripts = []
                if (typeof context.rawData === 'string' || typeof context.rawData === 'String') {
                    context.scripts.push(context.rawData)
                } else if (typeof context.rawData.length !== 'undefined' && context.rawData.length > 0) {
                    for (var i in context.rawData) {
                        context.scripts.push(context.rawData[i])
                    }
                } else {
                    if (typeof context.rawData.script === 'string' || typeof context.rawData.script === 'String') {
                        context.scripts.push(context.rawData.script)
                    } else if (typeof context.rawData.scripts !== 'undefined' && typeof context.rawData.scripts.length !== 'undefined' && context.rawData.scripts.length > 0) {
                        for (var i in context.rawData.scripts) {
                            context.scripts.push(context.rawData.scripts[i])
                        }
                    }
                    if (typeof context.rawData.callback !== 'undefined') {
                        context.callback = context.rawData.callback
                    }
                    context.scripts = context.removePreloaded(context.scripts);

                    context.noCache = context.rawData.noCache === true

                    context.removeOld = context.rawData.removeOld === true
                    context.removeOldScripts = context.rawData.removeOldScripts === true
                    context.removeOldStyles = context.rawData.removeOldStyles === true
                }

                if (typeof styles_container !== 'undefined') {
                    if (typeof styles_container === 'string' || typeof styles_container === 'String') {
                        styles_container = document.getElementById(styles_container)
                    }
                    context.m_head = styles_container
                }

                if (typeof scripts_container !== 'undefined') {
                    if (typeof scripts_container === 'string' || typeof scripts_container === 'String') {
                        scripts_container = document.getElementById(scripts_container)
                    }
                    context.m_scripts = scripts_container
                }

                setTimeout(context.load)
            }
            ()
    }

    return {
        load(data) {
            new ScriptLoaderInternal(data)
        }
    }
}()