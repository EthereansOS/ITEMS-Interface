if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(test) {
        return this.indexOf(test) === 0;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(test) {
        return this.indexOf(test) + test.length === this.length;
    };
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

if (!String.prototype.containsAloneWord) {
    String.prototype.containsAloneWord = function(searchText) {
          return new RegExp("( |\n|\t|^)" + searchText + "( |\n|\t|$)", "i").test(this)
    };
}

if (!String.prototype.removeHTMLComments) {
    String.prototype.removeHTMLComments = function() {
        return this.replace(/<!.*?-->/g, '')
    };
}

if (!String.prototype.deHTML) {
    String.prototype.deHTML = function deHTML() {
        var e = document.createElement('div');
        e.innerHTML = unescape(this);
        return e.childNodes.length === 0 ? "" : e.childNodes[0].innerHTML + '...';
    };
}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(pattern, replace) {
        return this.split(pattern).join(replace);
    };
}

if (!String.prototype.toCamelCase) {
    String.prototype.toCamelCase = function() {
        var s = this.replaceAll(' ', '_').replaceAll('-', '_');
        var words = s.split('_');
        if (words.length === 1) {
            return words[0];
        } else {
            var result = words[0];
            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                result += word.substr(0, 1).toUpperCase() + word.substr(1);
            }
            return result;
        }
    };
}

if (!String.prototype.firstLetterToLowerCase) {
    String.prototype.firstLetterToLowerCase = function() {
        if (this.replaceAll(" ", "") === '') {
            return this;
        } else {
            var s = this.charAt(0).toLowerCase();
            if (this.length > 1) {
                s += this.substring(1);
            }
            return s;
        }
    };
}

if (!String.prototype.firstLetterToUpperCase) {
    String.prototype.firstLetterToUpperCase = function() {
        if (this.replaceAll(" ", "") === '') {
            return this;
        } else {
            var s = this.charAt(0).toUpperCase();
            if (this.length > 1) {
                s += this.substring(1);
            }
            return s;
        }
    };
}

if (!String.prototype.allWordsToUpperCase) {
    String.prototype.allWordsToUpperCase = function() {
        if (this.replaceAll(" ", "") === '') {
            return this;
        } else {
            var s = '';
            var split = this.split(' ');
            for (var word in split) {
                s += split[word].firstLetterToUpperCase() + ' ';
            }
            s = s.substring(0, s.length - 1);
            return s;
        }
    };
}

if (!String.prototype.allWordsToLowerCase) {
    String.prototype.allWordsToLowerCase = function() {
        if (this.replaceAll(" ", "") === '') {
            return this;
        } else {
            var s = '';
            var split = this.split(' ');
            for (var word in split) {
                s += split[word].firstLetterToLowerCase() + ' ';
            }
            s = s.substring(0, s.length - 1);
            return s;
        }
    };
}

if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({
                toString: null
            }).propertyIsEnumerable('toString'),
            dontEnums = ['toString',
                'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
                'propertyIsEnumerable', 'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' &&
                (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [],
                prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

if(!Number.prototype.isPrintable) {
    Number.prototype.isPrintable = function isPrintable() {
        var value = parseInt(this.toString())
        return (value > 47 && value < 58)   || // number keys
            (value > 64 && value < 91)      || // letter keys
            (value > 95 && value < 112)     || // numpad keys
            (value > 185 && value < 193)    || // ;=,-./` (in order)
            (value > 218 && value < 223);      // [\]' (in order)
    }
}

if(!String.prototype.printJustDate) {
    String.prototype.printJustDate = function printJustDate() {
        var date = new Date(this);
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        if(d < 10) {
            d = "0" + d;
        }
        if(m < 10) {
            m = "0" + m;
        }
        return d + "/" + m + "/" + y;
    }
}

if(!String.prototype.fromWhen) {
    String.prototype.fromWhen = function fromWhen() {
        return moment(new Date(this)).locale($('html').attr('lang')).startOf('second').fromNow();
    }
}

var base_url = document.location.protocol +
    '//' +
    document.location.hostname +
    ((document.location.port === '' || parseInt(document.location.port) == 80 || parseInt(document.location.port) == 443) ? '' :
        (':' + document.location.port));

var local_url = base_url;