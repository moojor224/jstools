import { createElement } from "./createElement.js";
import { Prism } from "./lib/prism.js";
import { js_beautify } from "./lib/beautify.js";
import { flattenChildNodes } from "./arrays.js";

/**
 * @param {any | undefined} val 
 * @param {any} def 
 * @returns {any | undefined}
 */
export function getValueOrDefault(val, def) {
    if (val === undefined || val === null) return def;
    return val;
}

/**
 * puts the properties from source onto target
 * @type {<T, K>(target: T, source: K) => T & K}
 * @returns {T & K}
 */
export function extend(target, source) {
    Object.keys(source).forEach(key => {
        target[key] = source[key];
    });
    return target;
}

/**
 * returns an object whose valueof result will always be synced with the return value of the function
 * @param {Function} callback function to call
 * @param  {...any} args arguments to pass to function
 * @example
 * let val = lockValue(function(){
 *     return Math.floor(Math.random() * 10);
 * });
 * console.log(+val);
 * console.log(+val);
 * console.log(+val);
 * console.log(+val);
 * // logs 4 random numbers
 */
export function lockValue(callback, ...args) {
    return class {
        constructor() { }
        static valueOf() {
            return callback(...args);
        }
    }
}

/**
 * generates a string template function or smth idk
 * @param {string[]} strings plain-text strings
 * @param  {...string} keys keys to interpolate
 * @returns {Function}
 * 
 * @example
 * const template = makeTemplate`I'm ${"name"}. I'm almost ${"age"} years old.`;
 * template({ name: "MDN", age: 30 }); // "I'm MDN. I'm almost 30 years old."
 * 
 * @example
 * const template = makeTemplate`I'm ${0}. I'm almost ${1} years old.`;
 * template("MDN", 30); // "I'm MDN. I'm almost 30 years old."
 */
export function makeTemplate(strings, ...keys) {
    return function (...values) {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach((key, i) => {
            const value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join("");
    };
}

/**
 * uses JSON.stringify and JSON.parse to copy an object and return the copy\
 * WARNING: do not use on objects that contain recursive references, or an error will be thrown
 * @param {Object} obj object to copy
 * @returns {Object}
 * @example
 * let obj1 = {
 *     a: 1,
 *     b: 2,
 *     c: 3
 * }
 * let obj2 = copyObject(obj1) // {a: 1, b: 2, c: 3}
 * obj1.a = 4;
 * // obj1 == {a: 4, b: 2, c: 3}
 * // obj2 == {a: 1, b: 2, c: 3}
 */
export function copyObject(obj) {
    let result = obj;
    var type = {}.toString.call(obj).slice(8, -1);
    if (type == 'Set') return new Set([...obj].map(value => copyObject(value))); // convert list of values to array and copy each value
    if (type == 'Map') return new Map([...obj].map(kv => [copyObject(kv[0]), copyObject(kv[1])])); // convert map to array of key-value pairs and copy each pair
    if (type == 'Date') return new Date(obj.getTime()); // make new date from epoch time
    if (type == 'RegExp') return RegExp(obj.source, getRegExpFlags(obj)); // make new regexp from source pattern and flags
    if (type == 'Array' || type == 'Object') { // arrays are just objects whose keys are entirely numeric
        result = Array.isArray(obj) ? [] : {}; // make new array or object
        for (var key in obj) { // loop through each value or key in the object
            result[key] = copyObject(obj[key]); // copy and apply each value or key to the new object
        }
    }
    // any other data types that make it through are pass-by-value, so they don't need to be copied
    return result; // return copied object
}

/**
 * converts an entire string to html entities
 * @param {string} str string to convert
 * @returns {string} converted string
 */
export function toHTMLEntities(str) {
    return str.split("").map(e => `&#${e.charCodeAt(0)};`).join("");
}

const PRISM_CLASSES = [ // list of prism.js classes and their corresponding colors
    [["cdata", "comment", "doctype", "prolog"], "#6a9955"],
    [["constant", "symbol", "tag"], "#4fc1ff"],
    [["number"], "#b5cea8"],
    [["attr-name", "builtin", "char", "inserted", "string"], "#ce9178"],
    [["entity", "url", "variable"], "#f4b73d"],
    [["atrule", "attr-value", "keyword", "boolean"], "#569cd6"],
    [["important", "regex"], "#ee9900"],
    [["deleted"], "#ff0000"],
    [["function"], "#dcdcaa"],
    [["parameter", "property", "function-variable"], "#9cdcfe"],
    [["template-punctuation"], "#ce9178"],
    [["interpolation-punctuation"], "#ffff00"],// "#ff8800"],
    [["punctuation", "operator"], "#ffffff"],
    [["class-name"], "#4ec9b0"],
    [["selector"], "#d7ba7d"],
];


/**
 * @typedef LogFormattedConfig
 * @property {boolean} embedObjects embed the objects within the console message
 * property {T} raw return the raw result without logging it to the console
 * @property {boolean} collapsed log the message inside a collapsed console group (slightly increases performance before initially logging the object). Will still lag when collapsed group is initially opened
 * @property {number} maxDepth maximum depth to stringify
 * @property {string} label label for collapsed console group
 */
/**
 * logs a syntax-highlighted, formatted version of an object to the console
 * @param {any} object the object to parse
 * @type {{
 * (object: any, options?: LogFormattedConfig | {raw: true}) => {html:string,logs:string,styles:string[]},;
 * (object: any, options?: LogFormattedConfig | {raw: false|undefined}) => void;
 * }}
 */
export let logFormatted = function (object, options = {}) {
    let { embedObjects, raw, collapsed, maxDepth, label, extra_logs, enableCustomFormatters } = extend({
        embedObjects: false,
        raw: false,
        collapsed: false,
        maxDepth: Infinity,
        label: "formatted log",
        extra_logs: [],
        enableCustomFormatters: false,
    }, options);
    if (enableCustomFormatters) {
        // use custom formatters to make the object interactive
        console.error("custom formatters not implemented yet");
        return logFormatted(object, { embedObjects, raw, collapsed, maxDepth, label, extra_logs, enableCustomFormatters: false });
    } else {
        let objects = []; // array that holds list of all objects
        let indentAmount = 1; // number of spaces to indent the stringified object by
        let depth = 0; // current depth
        let embedIndex = 0; // how many characters have been stringified
        let indexes = []; // array of indexes where objects should be embedded
        /**
         * alternative to JSON.stringify that auto-formats the result and supports functions
         * @param {any} obj object to stringify
         * @returns {string}
         */
        function stringify(obj) {
            if (depth > maxDepth) { // prevent stringifying objects deeper than the max depth
                let str = "'<max depth reached>'";
                embedIndex += str.length
                return str;
            }
            const type = typeof obj; // store type of object
            let pad = " ".repeat(indentAmount * 4); // calulate number of spaces to indent
            if (type == "number" || type == "boolean") { // primitives
                let str = "" + obj; // convert to string
                embedIndex += str.length; // add string length to total characters stringified
                return obj;
            } else if (type == "function") {
                objects.push(obj); // add to list of objects
                let beautified = js_beautify(obj.toString().replaceAll("\r", "")); // beautify function to make tabs equal
                let splitFunc = beautified.split("\n"); // split formatted function by lines
                while (splitFunc.length > 1 && splitFunc[1].length == 0) {
                    splitFunc.splice(1, 1);// remove first line of function body if it's blank (optional)
                }
                let padded = splitFunc.map((e, n) => (n > 0 ? pad.substring(4) + e : e + " ")); // indent all lines after first to match current indent amount and add space to end of first line
                embedIndex += padded[0].length; // length of first line
                indexes.push(embedIndex);
                embedIndex += (padded.slice(1).join("\n").length + 1); // length of all lines after first line + newline between 1st and 2nd line
                return padded.join("\n"); // rejoin function lines and return
            } else if (type == "string") {
                let quote;
                if (!obj.includes('"')) { // if there are no ", wrap with "
                    quote = '"';
                } else if (!obj.includes("'")) { // otherwise, if no ', wrap with '
                    quote = "'";
                } else if (!obj.includes("`")) {
                    quote = '`'; // otherwise, if no `, wrap with `
                } else {
                    quote = '"'; // otherwise, wrap with "
                }
                [
                    ["\n", "\\n"],
                    ["\r", "\\r"],
                    ["\t", "\\t"],
                    [quote, "\\" + quote], // only escape the quotes that are the same as what the string is wrapped with
                ].forEach(e => {
                    obj = obj.replaceAll(e[0], e[1]); // escape quotes and all escape characters
                });
                let str = `${quote}${obj}${quote}`; // wrap string with quotes
                embedIndex += str.length; // add to stringified character count
                return str;
            } else if (type == "object") {
                if (objects.includes(obj)) { // prevent recursion by checking objects that have already been stringified
                    let str = "<already stringified (recursion prevention)>"; // return plain string
                    embedIndex += str.length; // add to character count
                    indexes.push(embedIndex); // save index
                    return str;
                }
                objects.push(obj); // add to list of objects
                let arr = []; // make array that stores all of this object's properties
                indentAmount++; // increment indent amount
                depth++; // increment depth

                embedIndex += 2; // opening brace/bracket+space
                indexes.push(embedIndex); // embed object after opening brace/bracket
                embedIndex += (1 + // newline after opening brace/bracket
                    pad.length); // first line pad

                if (Array.isArray(obj)) { // object is an array
                    obj.forEach((item, index) => { // loop through array items
                        let str = stringify(item);
                        arr.push(str);
                        if (index < obj.length - 1) {
                            embedIndex += 2 + // comma+newline
                                pad.length; // next line pad
                        }
                    });
                    indentAmount--; // decrement indent amount
                    depth--; // decrement depth
                    embedIndex += (1 + // newline before closing bracket
                        (pad.length - 4) + // end pad
                        1); // closing bracket
                    return `[ \n${pad + arr.join(",\n" + pad)}\n${pad.substring(4)}]`;
                } else {
                    if (!obj) { // typeof null === "object"
                        embedIndex += 4;
                        return "null";
                    }
                    let entries = Object.entries(obj);
                    entries.forEach(function (kvp, index) {
                        let [key, value] = kvp;
                        embedIndex += key.length + // key length
                            2; // colon+space
                        let str = stringify(value); // convert value to string
                        str = `${key}: ${str}`; // create stringified kvp
                        arr.push(str); // add to array
                        if (index < entries.length - 1) { // only increment for comma/newlines between lines (1 less than the number of entries)
                            embedIndex += 2 + // comma+newline
                                pad.length; // next line pad
                        }
                    });
                    indentAmount--; // decrement indent amount
                    depth--; // decrement depth
                    let returnVal = `{ \n${pad + arr.join(",\n" + pad)}\n${pad.substring(4)}}`;
                    embedIndex += 1 + // newline before closing brace
                        (pad.length - 4) +  // end pad
                        1; // closing brace
                    return returnVal;
                }
            } else {
                let str = "" + obj; // convert to string
                embedIndex += str.length; // add string length to character count
                return str;
            }
        }

        let element = createElement("div", { innerHTML: Prism.highlight(stringify(object), Prism.languages.javascript).replaceAll("%", "%%") }); // syntax-highlight stringified code and put the result into a div
        if (typeof object == "object") element.innerHTML = `let ${label} = ${element.innerHTML}`; // add variable name to the beginning of the message

        const regex = /(?<!%)(%%)*%[co]/g; // regex for matching [co] with odd number of 5 before it

        function calcStyle(element) { // get calculated color of a text node based off of the classes it has
            if (!element.style) return; // if element isa text node, return
            let classList = [...element.classList]; // convert class list to array
            classList.forEach(clss => { // loop through element classes
                PRISM_CLASSES.forEach(pclass => { // check against each prism.js class
                    if (pclass[0].includes(clss)) element.style.color = pclass[1];
                });
            });
        }

        let logs = [];
        let styles = [];
        const flattened = flattenChildNodes(element); // get list of all nodes in element
        flattened.forEach(calcStyle); // manually set style.color for each element based off of its classes
        if (embedObjects) { // objects will be embedded into the console.log statement for better inspection
            let index = 0; // current character index
            let lastPercent = false; // whether the last character was a % (functions as an escape character)
            function count(node) { // count through each character of the node's textContent and inject a %o
                let text = ""; // processed text
                node.textContent.split("").forEach(function (char) {
                    if (char == "\r") return; // completely ignore carriage returns
                    if (index == indexes[0]) { // if current character count is where a %o needs to be injected
                        indexes.shift(); // remove the inject index
                        text += "%o"; // inject
                    }
                    if (char == "%" && !lastPercent) lastPercent = true; // next character should be escaped
                    else if (lastPercent) { // if this character should be escaped
                        lastPercent = false; // character has been escaped
                        index++; // increment index
                    } else index++;
                    text += char; // add character to processed text
                });
                node.textContent = text; // set node content to processed text
            }
            flattened.forEach(e => { // loop through all nodes and count through the text nodes
                if (e.nodeName.includes("text")) count(e);
            });
        }

        flattened.forEach(e => { // convert text nodes to console log with interleaved formatting
            if (e.nodeName != "#text") return;
            logs.push(`%c${e.textContent}`); // push formatting tag and textContent
            let color = ""; // set color to default
            if (e.parentNode.style.color) color = `color:${e.parentNode.style.color};`; // if parent node has color, set it
            styles.push(color); // add style to list
        });
        logs = logs.join(""); // join all text nodes into one message

        function regexSplit(string) { // splits a string along REGEX and returns both the matches and split string
            let str = [], reg = [], match, lastindex = 0, index;
            while (match = regex.exec(string)) { // while string has match to the regex
                index = match.index;
                let kind = match[0], mod = 0; // kind is the string that was matched
                if (kind.length > 2) { // if match  has more than one %
                    str[str.length - 1] += kind.substring(0, kind.length - 2); // add extra % to previous split string
                    mod = kind.length - 2; // offset index by amount of extra %
                    kind = kind.substring(kind.length - 2);
                }
                str.push(string.substring(((lastindex + 2) > index ? index : (lastindex + 2)), index)); // push string from (end of last match to beginning of this match) to list
                lastindex = index + mod; // offset index
                reg.push(kind); // push %[oc] to matches list
            }
            str.push(string.substring(lastindex + 2)); // add final chunk of string to list of splits
            return { split: str, matches: reg, };
        }

        let { matches, split } = regexSplit(logs), final = [], finalStyles = [];
        function calcObject(obj) {
            if (typeof obj == "function" && obj.toString().startsWith("class")) {
                return "";
            }
            return obj;
        }
        while (matches.length > 0) {
            let type = matches.shift(); // get %[oc] from list
            final.push(split.shift() || ""); // add first split string to list
            final.push(type); // push %[oc] to list
            if (type == "%o") finalStyles.push(calcObject(objects.shift())); // if %[oc] is %o, push object
            else finalStyles.push(styles.shift() || ""); // else type is %c, so push style
        }
        while (split.length > 0) final.push(split.shift()); // push all remaining strings
        while (embedObjects && objects.length > 0) finalStyles.push(objects.shift()); // push all remaining objects
        while (styles.length > 0) finalStyles.push(styles.shift()); // push all remaining styles
        function checkExtraLogs() {
            if (extra_logs.length > 0) {
                extra_logs.forEach(e => console.log(e));
            }
        }
        final = final.join(""); // join array into one message
        if (raw) return { logs: final, styles: finalStyles, html: element.outerHTML } // return raw results without logging to console
        else {
            if (collapsed) { // if console log should be inside collapsed console group
                console.groupCollapsed(label); // create collapsed group
                checkExtraLogs(); // log any extra messages
                console.log(final, ...finalStyles); // log formatted message
                console.groupEnd(); // end group
            } else console.log(final, ...finalStyles); // log formatted message
        }
    }
}
logFormatted.PRISM_CLASSES = PRISM_CLASSES; // add prism.js classes to logFormatted function

/**
 * stringifies an object
 * @param {any} obj the object to  stringify
 * @returns {string} the stringified object
 */
export function stringify(obj) {
    let objects = []; // array that holds list of all objects
    let indentAmount = 1; // number of spaces to indent the stringified object by (don't change this)
    let indentWidth = 4; // width of each indent. change this to change indent width
    let depth = 0; // current depth
    let maxDepth = 100;

    function internal_stringify(obj) {
        if (depth > maxDepth) { // prevent stringifying objects deeper than the max depth
            let str = "'<max depth reached>'";
            return str;
        }
        const type = typeof obj; // store type of object
        let pad = " ".repeat(indentAmount * indentWidth); // calulate number of spaces to indent
        if (type == "number" || type == "boolean") { // primitives
            return "" + obj;
        } else if (type == "function") {
            return obj.toString().replaceAll("\r", "").trim();
        } else if (type == "string") {
            let quote;
            if (!obj.includes('"')) { // if there are no ", wrap with "
                quote = '"';
            } else if (!obj.includes("'")) { // otherwise, if no ', wrap with '
                quote = "'";
            } else if (!obj.includes("`")) { // otherwise, if no `, wrap with `
                quote = '`';
            } else { // otherwise, wrap with "
                quote = '"';
            }
            [
                ["\n", "\\n"],
                ["\r", "\\r"],
                ["\t", "\\t"],
                [quote, "\\" + quote], // only escape the quotes that are the same as what the string is wrapped with
            ].forEach(e => {
                obj = obj.replaceAll(e[0], e[1]); // escape quotes and all escape characters
            });
            let str = `${quote}${obj}${quote}`; // wrap string with quotes
            return str;
        } else if (type == "object") {
            if (!obj) { // typeof null === "object"
                return "null";
            }
            if (objects.includes(obj)) { // prevent recursion by checking objects that have already been stringified
                let str = "<already stringified (recursion prevention)>"; // return plain string
                return str;
            }
            objects.push(obj); // add to list of objects
            let arr = []; // make array that stores all of this object's properties
            indentAmount++; // increment indent amount
            depth++; // increment depth

            if (Array.isArray(obj)) { // object is an array
                obj.forEach((item, index) => { // loop through array items
                    let str = internal_stringify(item);
                    arr.push(str);
                });
                indentAmount--; // decrement indent amount
                depth--; // decrement depth
                return `[ \n${pad + arr.join(",\n" + pad)}\n${pad.substring(4)}]`;
            } else {
                let entries = Object.entries(obj);
                entries.forEach(function (kvp, index) {
                    let [key, value] = kvp;
                    let str = internal_stringify(value); // convert value to string
                    str = `${key}: ${str}`; // create stringified kvp
                    arr.push(str); // add to array
                });
                indentAmount--; // decrement indent amount
                depth--; // decrement depth
                return `{\n${pad + arr.join(",\n" + pad)}\n${pad.substring(4)}}`;
            }
        } else {
            return "" + obj; // just convert to string and return
        }
    }
    return internal_stringify(obj);
}

/**
 * logs and returns an object
 * @param {any} arg
 * @returns {typeof arg}
 */
export function logAndReturn(arg) {
    console.log(arg);
    return arg;
}

/**
 * a set of utility functions to convert times to milliseconds
 */
export let timeConversions = (function () {
    let seconds = t => t * 1000;
    let minutes = t => t * seconds(60);
    let hours = t => t * minutes(60);
    let days = t => t * hours(24);
    let weeks = t => t * days(7);
    let years = t => t * days(365);
    return { seconds, minutes, hours, days, weeks, years };
})();

/**
 * checks if a functon is asynchronous
 * @param {Function} func the function to check
 * @returns {Boolean}
 */
export function isAsync(func) {
    const AsyncFunction = (async () => { }).constructor;
    return func instanceof AsyncFunction;
}

export const BULK_OPERATIONS = (function () {
    if (globalThis.jstools_defined) return;
    class Numbers {
        constructor(...values) {
            this.values = values;
        }
    }
    let ops = [
        ["divide", (a, b) => a / b],
        ["multiply", (a, b) => a * b],
        ["add", (a, b) => a + b],
        ["subtract", (a, b) => a - b],
        ["pow", (a, b) => a ** b],
        ["mod", (a, b) => a % b],
    ];
    for (let [name, func] of ops) {
        Numbers.prototype[name] = function (val) {
            return new Numbers(...this.values.map(e => func(e, val)));
        };
    }
    class Booleans {
        constructor(...values) {
            this.values = values;
        }
        flip() {
            return new Booleans(...this.bools.map(e => !e));
        }
    }
    function makeNewClass(clss) {
        let newClass = class { constructor(...values) { this.values = values; } }
        let methods = Object.getOwnPropertyNames(clss.prototype).sort();
        methods.forEach(m => {
            newClass.prototype[m] = function (...args) {
                return new newClass(...this.values.map(e => e[m].apply(e, args)));
            }
        });
        return newClass;
    }
    function getTypes(...args) {
        let types = args.map(e => typeof e);
        let unique = [...new Set(types)];
        if (unique.length == 1) {
            return unique[0];
        }
        return "mixed";
    }
    const Strings = makeNewClass(String);
    const Functions = makeNewClass(Function);
    const Objects = makeNewClass(Object);
    function autodetectClass(type) {
        switch (type) {
            case "number": return Numbers;
            case "string": return Strings;
            case "boolean": return Booleans;
            case "object": return Objects;
            case "function": return Functions;
            default: return null;
        }
    }
    return {
        Numbers,
        Strings,
        Booleans,
        Objects,
        Functions,
        autodetect: function (...args) {
            let type = getTypes(...args);
            return autodetectClass(type);
        }
    };
})();

/** @typedef {(BasicAny | NestedBasicAnyArray)[]} NestedBasicAnyArray */
/** @typedef {string | number | boolean} BasicAny */
/**
 * @template T
 * @typedef {| (T extends infer U ? U : never) | Extract<T, number | string | boolean | bigint | symbol | null | undefined | []> | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> })} Narrow
 */
/**
 * creates a readonly enum from the provided values\
 * type declarations make it so that your IDE will show the original values on hover
 * @template E
 * @type {<E extends Record<string, BasicAny | NestedBasicAnyArray>>(values: Narrow<E>) => E}
 */
export function createEnum(values) {
    return Object.freeze(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Symbol(value)])));
}

/**
 * this type definition actually somehow works better than createEnum, but it might be a bug so I'm leaving createEnum in
 * @type {<E extends Record<string, T>, T>(values: Narrow<E>) => E}
 */
export const createTypedEnum = createEnum;

/**
 * simple wrapper function for a type declaration
 * @type {<E extends Record<string, T>, T>(values: Narrow<E>) => E}
 */
export function createDummyEnum(values) {
    return values;
}

/**
 * creates a readonly constant from the provided values\
 * type declarations make it so that your IDE will show the original values on hover
 * @template E
 * @type {<E extends BasicAny | NestedBasicAnyArray>(values: Narrow<E>) => E}
 */
export function constant(val) {
    return Object.freeze(val);
}

export function prismToJSONML(prism) {
    let el = document.createElement("div");
    el.innerHTML = prism;
    let jsonml = [];
    function getStyle(node) {
        node.classList.remove("token");
        return "color:" + node.classList[0];
        let style = "";
        PRISM_CLASSES.forEach(pclass => {
            // console.log(pclass[0], node.classList[0]);
            if (pclass[0].includes(node.classList[0])) {
                // console.log("includes");
                style = `color:${pclass[1]}`;
            }
        });
        return style;
    }
    function parse(node) {
        if (node.nodeName == "#text") {
            return node.textContent;
        }
        if (!node.childNodes) {
            console.log(node);
        }
        let children = [...node.childNodes].map(parse);
        return [node.nodeName.toLowerCase(), {
            style: getStyle(node),
        }, ...children];
    }
    let parsed = parse(el);
    // console.log("converted", el.outerHTML, "to", JSON.stringify(parsed));
    return parsed;
}

export function wrapInQuotes(str) {
    if (!str.includes('"')) return `"${str}"`;
    if (!str.includes("'")) return `'${str}'`;
    if (!str.includes("`")) return `\`${str}\``;
    return `"${str.replaceAll('"', '\\"')}"`;
}

/**
 * @returns {"Edge" | "Firefox" | "Chrome" | "Safari" | "Opera" | "Unknown"}
 */
export function getBrowserType() {
    let ua = navigator.userAgent;
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Opera")) return "Opera";
    return "Unknown";
}

export function objectToJSONML(obj) {
    function parse(obj) {
        if (["string", "boolean", "number"].includes(typeof obj)) {
            return ["span", obj];
        }
        if (Array.isArray(obj)) {
            return obj.map(parse);
        }
        let children = Object.entries(obj).map(([key, value]) => {
            return ["div", ["span", { style: "font-weight:bold" }, key + ": "], parse(value)];
        });
        return ["div", ...children];
    }
    return ["div", parse(obj)];
}

/**
 * gets the sha256 hash of a script
 * @param {string} source the raw source of the script
 * @returns {string} the sha256 hash of the script
 * @example
 * let hash = await hashScript("console.log('hello world')");
 */
export async function hashScript(source) {
    async function hashText(buffer) {
        return await crypto.subtle.digest("SHA-256", buffer);
    }

    async function integrityMetadata(buffer) {
        const hashBuffer = await hashText(buffer);
        const base64string = btoa(
            String.fromCharCode(...new Uint8Array(hashBuffer))
        );

        return `sha256-${base64string}`;
    }

    async function hash(source) {
        const response = await fetch(source);
        const buffer = await response.arrayBuffer();
        const integrity = await integrityMetadata(buffer);
        return integrity;
    }
    return await hash(source);
}

/**
 * gets the file and line number of where the getStack function is called
 * @returns {{
 *     file: string,
 *     lineno: string,
 *     charno: string,
 *     trace: string[]
 * }}
 */
export function getStack() {
    let err = new Error().stack.replace(/^Error/g, "").trim().split("\n");
    let originalLine = err[2].trim().replace(/^@|^at /g, "");
    let file = originalLine.replace(/:\d+:\d+$/g, "");
    let lindex = originalLine.match(/:(\d+):\d+\)?$/g)[0];
    let line = lindex.match(/(?<=^:)\d+(?=:)/g)[0];
    let char = lindex.match(/\d+(?=\)?$)/g)[0];
    return { file, lineno: line, charno: char, trace: err };
}