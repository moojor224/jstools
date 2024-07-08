import override from "./_node_overrides.js";
import { extend, makeTemplate } from "./utility.js";
import { createElement } from "./createElement.js";
override();

/** @type {String[]} */
const validStyles = (function getProperties() {
    let result = [
        "overflow",
        "border", "border-width", "border-right", "border-left", "border-top", "border-bottom", "border-radius", "border-color", "border-style",
        "padding",
        "grid-row", "grid-column",
    ];
    try {
        let frame = document.createElement("iframe");
        document.body.append(frame);
        let win = frame.contentWindow;
        if (!win) throw new Error("no window");
        let div = win.document.createElement("div");
        win.document.body.append(div);
        let computed = win.getComputedStyle(div);
        let styles = Object.keys(computed).filter(e => !isNaN(parseInt(e)));
        styles = styles.map(e => computed[e]);
        styles = Array.from(new Set([styles, result].flat().flatMap(e => [e, e.replaceAll(/-[a-z]/g, m => m.toUpperCase()[1]), e.replaceAll(/[A-Z]/g, m => "-" + m.toLowerCase())])));
        result = styles.sort();
        frame.remove();
    } catch (err) {
        console.log("error getting valid CSS styles", err);
        return ["err"];
    }
    return result;
})();
// console.log("validStyles", validStyles.join("\n"));
const checkValidSelector = function (selector) {
    selector = selector.trim();
    if (typeof selector != "string") return false;
    if (selector.length == 0) return false;
    try {
        let sheet = new CSSStyleSheet();
        sheet.insertRule(selector + "{}");
        return true;
    } catch (e) {
        return false;
    }
}
export class jst_CSSRule {
    /** @type {jst_CSSStyleSheet} */
    stylesheet = null;

    /** @type {CSSStyleDeclaration} */
    _style = {};
    style = new Proxy(this._style, {
        get: (target, prop) => {
            return target[prop];
        },
        set: (target, prop, value) => {
            let newName = prop;
            if (!prop.startsWith("--")) {
                newName = prop.replaceAll(/[A-Z]/g, e => `-${e.toLowerCase()}`);
                if (!validStyles.includes(newName) && !validStyles.includes("err")) throw new Error("Invalid style property: " + prop);
            }
            target[newName] = value;
            this.update();
            return true;
        }
    });
    selector = "";
    /**
     * @param {String} selector
     * @param {typeof this._style} styles
     */
    constructor(selector, styles = {}) {
        if (!checkValidSelector(selector)) throw new Error("Invalid selector: " + selector);
        let givenstyles = Object.entries(styles);
        let invalid = givenstyles.filter(e => !(validStyles.includes(e[0]) || e[0].startsWith("--") || (validStyles.length == 1 && validStyles[0] == "err"))).map(e => e[0]).join(", ");
        if (invalid.length > 0) throw new Error("Invalid style properties: " + invalid);
        givenstyles.forEach(e => {
            let changed = false;
            let newName = e[0].replaceAll(/[A-Z]/g, e => {
                changed = true;
                return `-${e.toLowerCase()}`;
            }); // convert name to valid css notation
            if (changed) {
                if (!validStyles.includes(newName)) return;
                styles[newName] = e[1];
                delete styles[e[0]];
            }
        });
        extend(this._style, styles);
        this.selector = selector;
    }

    /**
     * returns the final selector of this style rule by combining all parent selectors
     * @returns {String}
     */
    get computedSelector() {
        let selectorChain = [this.selector];
        let target = this;
        while (target.stylesheet instanceof jst_CSSRule) {
            target = target.stylesheet;
            selectorChain.unshift(target.selector);
        }
        selectorChain = selectorChain.reduceRight(function (previousValue, currentValue) {
            let result = [];
            currentValue.split(",").forEach(e => {
                previousValue.split(",").forEach(f => {
                    result.push(e.trim() + " " + f.trim());
                });
            });
            return result.join(",\n").trim();
        }, "");
        selectorChain = selectorChain.replaceAll(/ (&|&?(?=[>]))/g, ""); // remove unnecessary spaces and combine selectors that should be combined
        return selectorChain;
    }

    /** @param {boolean} minify */
    compile(minify = false) {
        let selector = this.computedSelector;
        let part, whole, join;
        if (minify) {
            part = makeTemplate`${0}:${1}`;
            whole = makeTemplate`${0}{${1}}${2}`;
            join = "";
        } else {
            part = makeTemplate`${0}: ${1};`;
            whole = makeTemplate`${0} {\n    ${1}\n}\n${2}`;
            join = "\n";
        }
        let rules = Object.entries(this._style).map(e => part(...e)).join(";");
        if (rules.length == 0) whole = makeTemplate`${2}`; // if there are no rules, return only the compiled child rules
        return whole(selector, rules, this._sub_rules.map(e => e.compile(minify)).join(""));
    }

    update() {
        console.log("updating CSSRule", this);
        this.attachedElements.forEach(([el]) => {
            extend(el.style, this._style);
        });
        if (this.stylesheet) this.stylesheet.update();
    }

    /** @type {HTMLElement[]} */
    attachedElements = [];
    /**
     * attaches the rule to an element
     * @param {HTMLElement} el the elenet to attach the rule to
     */
    attachTo(...el) {
        let rule = this; // save reference to this rule
        function attach(el) {
            if (!(el instanceof HTMLElement)) return; // only allow html elements
            let style = ""; // the original style
            if (el.hasAttribute("style")) { // if the element has a style attribute
                style = el.getAttribute("style"); // save the style
            }
            rule.attachedElements.push([el, style]); // add the element to the list of attached elements
            extend(el.style, rule._style); // extend the element's style with the rule's style
        }
        el.forEach(e => attach(e)); // loop through given elements
    }

    /**
     * detaches the rule from an element and optionally reverts the element to its original style
     * @param {HTMLElement} el the element to detach the rule from
     * @param {Boolean} revert whether to revert the element to its original style
     */
    detachFrom(el, revert = true) {
        if (!(el instanceof HTMLElement)) return; // only allow html elements
        let index = this.attachedElements.find(e => e[0] == el); // find the index of the element
        if (index < 0) return; // if the element is not attached, return
        let detachedEl = this.attachedElements.splice(index, 1)[0]; // remove the element from the list
        if (revert) detachedEl[0].style = detachedEl[1]; // if revert is true, revert the element to its original style
    }

    /** @type {jst_CSSRule[]} */
    _sub_rules = [];
    addRules(...rules) {
        rules.forEach(rule => {
            if (rule instanceof jst_CSSRule) {
                this._sub_rules.push(rule);
                rule.stylesheet = this;
            }
        });
        return this;
    }
}

export class jst_CSSStyleSheet {
    /** @type {jst_CSSRule[]} */
    rules = [];
    /**
     * creates a new stylesheet
     * @param {jst_CSSRule[]} rules array of rules
     */
    constructor(rules = []) {
        this.rules = rules.filter(e => e instanceof jst_CSSRule);
    }

    addRules(...rules) {
        rules.forEach(rule => {
            if (!(rule instanceof jst_CSSRule)) {
                return;
            }
            this.rules.push(rule);
            if (this.injected) {
                rule.stylesheet = this;
            }
        });
    }

    update() {
        console.log("updating stylesheet", this);
        if (this.injected) {
            this.styleElement.innerHTML = this.compile(true);
        }
    }

    /**
     * compiles the stylesheet into css text
     * @param {Boolean} minify whether to minify the result or not
     * @returns {String}
     */
    compile(minify) {
        let join = "\n";
        if (minify) {
            join = "";
        }
        let compiled = this.rules.map(e => {
            if (this.injected) {
                e.stylesheet = this;
            }
            return e.compile(minify)
        });
        return compiled.join(join);
    }

    /** @type {HTMLStyleElement} */
    styleElement = null;
    /** whether the stylesheet has been injected */
    injected = false;
    /** 
     * injects the stylesheet into the document
     * @param {Boolean} update whether to update the stylesheet if a rule is changed
     * @returns {String} the compiled stylesheet
     */
    inject(update = false) {
        if (this.injected) return;
        this.injected = true;
        let compiled = this.compile(true);
        let style = createElement("style", { innerHTML: compiled });
        this.styleElement = style;
        document.head.append(style);
        return compiled;
    }
}
