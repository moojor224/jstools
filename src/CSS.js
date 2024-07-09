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
            join = ";";
        } else {
            part = makeTemplate`${0}: ${1};`;
            whole = makeTemplate`${0} {\n    ${1}\n}\n${2}`;
            join = "\n    ";
        }
        let rules = Object.entries(this._style).map(e => part(...e)).join(join);
        if (rules.length == 0) whole = makeTemplate`${2}`; // if there are no rules, return only the compiled child rules
        return whole(selector, rules, this.sub_rules.map(e => e.compile(minify)).join(""));
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
    sub_rules = [];
    addRules(...rules) {
        rules.forEach(rule => {
            if (rule instanceof jst_CSSRule) {
                this.sub_rules.push(rule);
                rule.stylesheet = this;
            }
        });
        return this;
    }

    /**
     * looks for a rule in the stylesheet by its selector
     * @param {string} selector the selector to search for
     * @returns {jst_CSSRule}
     */
    findRule(selector) { } // placeholder

    checkCoverage(logResults = false) {
        let elements;
        let selector = this.computedSelector;
        try {
            elements = Array.from(document.querySelectorAll(selector.replaceAll(/:?:(after|before|hover|link|visited|active|focus(-within)?)/g, "")));
        } catch (err) {
            elements = Array.from(document.querySelectorAll(selector));
        }
        let results = { count: elements.length, elements, rule: this };
        if (logResults) {
            console.groupCollapsed("Checking coverage for rule:", this);
            console.log("Found", elements.length, `elements with selector: "${this.computedSelector}"`);
            if (elements.length > 0) console.log("Elements", elements);
            console.groupEnd();
        }
        return results;
    }
}

export class jst_CSSStyleSheet {
    /** @type {jst_CSSRule[]} */
    sub_rules = [];
    /**
     * creates a new stylesheet
     * @param {jst_CSSRule[]} rules array of rules
     */
    constructor(rules = []) {
        this.sub_rules = rules.filter(e => e instanceof jst_CSSRule);
    }

    addRules(...rules) {
        rules.forEach(rule => {
            if (!(rule instanceof jst_CSSRule)) {
                return;
            }
            this.sub_rules.push(rule);
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
    compile(minify = false) {
        let join = "\n";
        if (minify) join = "";
        let compiled = this.sub_rules.map(e => {
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

    /**
     * looks for a rule in the stylesheet by its selector
     * @param {string} selector the selector to search for
     * @returns {jst_CSSRule}
     */
    findRule(selector) { } // placeholder

    checkCoverage(logResults = false) {
        if (logResults) {
            console.groupCollapsed("Checking coverage for stylesheet", this);
        }
        let coverageResults = this.sub_rules.flatMap(e => flatRule(e)).map(e => e.checkCoverage(logResults));
        let covered = 0, total = coverageResults.length, unused = [];
        coverageResults.forEach(e => {
            if (e.count > 0) covered++;
            else unused.push(e.rule);
        });
        if (logResults) {
            console.log(`Coverage: ${covered}/${total} rules covered`);
            if (unused.length > 0) console.log("Unused rules", unused);
            console.groupEnd();
        }
    }
}

function flatRule(rule) {
    let result = [rule];
    rule.sub_rules.forEach(e => result.push(...flatRule(e)));
    return result;
}

function findRule(selector) {
    /** @type {jst_CSSRule[]} */
    let rules = this.sub_rules.flatMap(e => flatRule(e));
    let found = rules.find(rule => {
        let computed = rule.computedSelector;
        return computed == selector || computed.split(",").map(e => e.trim()).includes(selector);
    });
    return found;
}
jst_CSSRule.prototype.findRule = findRule;
jst_CSSStyleSheet.prototype.findRule = findRule;