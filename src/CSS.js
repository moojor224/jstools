import override from "./_node_overrides.js";
override();

export class jst_CSSRule {
    /**
     * a list of all valid css properties
     * @type {String[]}
     */
    static validStyles = (function getProperties() {
        let result = ["overflow", "border", "border-width", "padding", "border-right"];
        try {
            let win = window.open("about:blank", 'winname', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=20,height=20');
            if (!win) return ["err"];
            let div = win.document.createElement("div");
            win.document.body.append(div);
            let computed = win.getComputedStyle(div);
            let styles = Object.keys(computed).filter(e => isNaN(parseInt(e)));
            styles = Array.from(new Set([styles, result].flat().flatMap(e => [e, e.replaceAll(/-[a-z]/g, m => m.toUpperCase()[1]), e.replaceAll(/[A-Z]/g, m => "-" + m.toLowerCase())])));
            div.remove();
            win.close()
            result = styles.sort();
        } catch (err) {
            return ["err"];
        }
        return result;
    })();
    static checkValidSelector(selector) {
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
    /** @type {jst_CSSStyleSheet} */
    stylesheet = null;

    /** @type {CSSStyleDeclaration} */
    _style = {};
    style = new Proxy(this._style, {
        get: (target, prop) => {
            return target[prop];
        },
        set: (target, prop, value) => {
            let newName = prop.replaceAll(/[A-Z]/g, e => `-${e.toLowerCase()}`);
            if (!jst_CSSRule.validStyles.includes(newName) && !jst_CSSRule.validStyles.includes("err")) return;
            target[newName] = value;
            this.attachedElements.forEach(([el]) => {
                el.style[newName] = value;
            });
            if (this.stylesheet instanceof jst_CSSStyleSheet) {
                if (this.stylesheet.injected) {
                    this.stylesheet.styleElement.innerHTML = this.stylesheet.compile(true);
                }
            }
            return true;
        }
    });
    /**
     * @param {String} selector
     * @param {typeof this._style} styles
     */
    constructor(selector, styles) {
        let givenstyles = Object.entries(styles);
        let valid = givenstyles.every(e => jst_CSSRule.validStyles.includes(e[0]));
        if (!valid) {
            throw new Error("Invalid style properties: " + givenstyles.filter(e => !jst_CSSRule.validStyles.includes(e[0])).map(e => e[0]).join(", "));
        }
        Object.entries(styles).forEach(e => {
            let newName = e[0].replaceAll(/[A-Z]/g, e => `-${e.toLowerCase()}`);
            if (newName != e[0]) {
                if (!jst_CSSRule.validStyles.includes(newName)) return;
                styles[newName] = e[1];
                delete styles[e[0]];
            }
        });
        extend(this._style, styles);
        this.selector = selector;
    }

    /** @param {boolean} minify */
    compile(minify) {
        let join = "\n    ";
        let props = makeTemplate`${0}: ${1};`;
        let whole = makeTemplate`${"selector"} {\n    ${"properties"}\n}`;
        if (minify) {
            join = ";";
            props = makeTemplate`${0}:${1}`;
            whole = makeTemplate`${"selector"}{${"properties"}}`;
        }
        let properties = Object.entries(this._style).map(e => props(...e)).join(join);
        return whole({ selector: this.selector, properties: properties });
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

    addRules(...rules) {
        rules = rules.filter(e => e instanceof jst_CSSRule);

    }
}

export class jst_CSSStyleSheet {
    /** @type {jst_CSSRule} */
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
     */
    inject(update = false) {
        if (this.injected) return;
        this.injected = true;
        let compiled = this.compile(true);
        let style = createElement("style", { innerHTML: compiled });
        this.styleElement = style;
        document.head.append(style);
    }
}
