var resolve = require('path').resolve;

var useStrict = '"use strict";';
var safeTypeof = 'function _typeof(e){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?_typeof=function(t){return typeof t}:_typeof=function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},_typeof(e)}';
var asyncToGenerator = 'function _asyncToGenerator(e){return function(){var t=this,n=arguments;return new Promise(function(r,i){function o(e,t){try{var n=s[e](t),o=n.value}catch(f){i(f);return}n.done?r(o):Promise.resolve(o).then(u,a)}function u(e){o("next",e)}function a(e){o("throw",e)}var s=e.apply(t,n);u()})}}';
var style = '';
var script = '';
var scripts = 'window.exports=window.exports||{};!window.preloadedScripts && (window.preloadedScripts=[]);Array.prototype.push.apply(window.preloadedScripts,[';

const fs = require('fs');

const babel = require('../assets/plugins/react/babel.min');
const uglify = require('./lib/uglify-js');

const babelArgs = {
    presets: ['es2015', 'es2015-loose', 'react', 'stage-0'],
    plugins: ['transform-exponentiation-operator', 'transform-async-to-generator'],
    sourceMaps: true
};

const buldJsxs = async function(replacer, basePath, path) {
    !path && (path = '');
    for (let entry of fs.readdirSync(basePath + path)) {
        const curPath = path + "/" + entry;
        if ((fs.lstatSync(basePath + curPath)).isDirectory()) {
            await buldJsxs(replacer, basePath, curPath);
        } else {
            if (!entry.endsWith('.min.css') && !entry.endsWith('.jsx')) {
                continue;
            }
            scripts += ("'" + (basePath + curPath).split(replacer).join('') + "'" + ',');
            if (entry.endsWith('.min.css')) {
                var styleMin = fs.readFileSync(basePath + curPath, 'UTF-8');
                (styleMin.toLowerCase().split('null').join('').split(' ').join('')) && (style += styleMin);
                continue;
            }
            if (entry.endsWith('.jsx')) {
                var source = fs.readFileSync(basePath + curPath, 'UTF-8');
                source = babel.transform(source.split('<>').join('<React.Fragment>').split('</>').join('</React.Fragment>'), babelArgs).code;
                source = uglify.convenience(source);
                source = source.split(useStrict).join('');
                source = source.split(safeTypeof).join('');
                source = source.split(asyncToGenerator).join('');
                script += (source.trim() + ';');
                continue;
            }
        }
    }
};

async function run() {

    var baseFolder = resolve((__dirname + '/../')).split('\\').join('/') + '/';

    var sourceFolder = resolve((baseFolder + 'spa/')).split('\\').join('/');

    var scriptPath = sourceFolder + "/script.min.js";
    var stylePath = sourceFolder + "/style.min.css";

    try {
        try {
            fs.unlinkSync(scriptPath);
        } catch(e) {
        }
        try {
            fs.unlinkSync(stylePath);
        } catch(e) {
        }
        await buldJsxs(baseFolder, sourceFolder);
        scripts = scripts.substring(0, scripts.length - 1) + ']);';
        fs.writeFileSync(scriptPath, useStrict + safeTypeof + asyncToGenerator + scripts + script);
        fs.writeFileSync(stylePath, style);
    } catch (e) {
        if((e.message || e).toString().indexOf('no such file or directory') === -1) {
            throw e.message || e;
        }
    }
};

run().catch(console.error);