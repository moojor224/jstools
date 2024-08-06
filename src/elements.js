import { flattenChildNodes } from "./arrays.js";
import { bulkElements } from "./bulkElements.js";
import { createElement } from "./createElement.js";
import _node_overrides from "./_node_overrides.js";
import { jst_CSSRule as CSSRule, jst_CSSStyleSheet as CSSStyleSheet } from "./CSS.js";
_node_overrides();

// Adds polyfills for missing browser features.
if (!Element.prototype.computedStyleMap && globalThis.getComputedStyle != undefined) {
    Element.prototype.computedStyleMap = function () {
        return window.getComputedStyle(this);
    }
}

/**
 * adds a warning message to the specified elements
 * @param {String} str message to display
 * @param  {...(String | HTMLElement)} selectors elements to add warning message to
 */
export function warn(str = "!", ...selectors) {
    clearWarn(...selectors); // clear any existing warnings
    let w = createElement("warn", { // create warning element
        innerHTML: str
    });
    selectors.forEach(s => {
        let el = s;
        if (typeof s === "string") {
            el = document.querySelector(s);
        }
        el.append(w.cloneNode(true));
    });
}

/**
 * removes the warning message from the given elements
 * @param  {...(String | HTMLElement)} selectors elements to remove the warning message from
 */
export function clearWarn(...selectors) {
    selectors.forEach(s => {
        let el = s;
        if (typeof s === "string") {
            el = document.querySelector(s);
        }
        for (let e of el.children) { // only remove warning messages that are children of this element
            if (e.tagName.toLowerCase() == "warn") {
                e.remove();
            }
        }
    });
}

/**
 * adds an error message to the specified elements
 * @param {String} str message to display
 * @param  {...(String | HTMLElement)} selectors elements to add error message to
 */
export function error(str, ...selectors) {
    clearError(...selectors);
    let w = createElement("error", {
        innerHTML: str
    });
    selectors.forEach(s => {
        let el = s;
        if (typeof s === "string") {
            el = document.querySelector(s);
        }
        el.append(w.cloneNode(true));
    });
}

/**
 * removes the error message from the given elements
 * @param  {...(String | HTMLElement)} selectors elements to remove the error message from
 */
export function clearError(...selectors) {
    selectors.forEach(s => {
        let el = s;
        if (typeof s === "string") {
            el = document.querySelector(s);
        }
        for (let e of el.children) { // only remove error messages that are children of this element
            if (e.tagName.toLowerCase() == "error") {
                e.remove();
            }
        }
    });
}

/**
 * hides the given elements by adding the class "hidden"
 * @param  {...(String | Element)} selectors list of css selectors or elements
 */
export function hide(...selectors) {
    bulkElements(...selectors).classList.add("hidden");
}

/**
 * shows the given elements by removing the class "hidden"
 * @param  {...(String | Element)} selectors list of css selectors or elements
 */
export function show(...selectors) {
    bulkElements(...selectors).classList.remove("hidden");
}

/**
 * clears the given elements
 * @param  {...(String | Element)} selectors list of css selectors or elements
 */
export function clear(...selectors) {
    for (let s of selectors) {
        s = typeof s == "string" ? document.querySelector(s) : s; // convert string to queried element
        let arr = flattenChildNodes(s); // get all descendant nodes in order
        if (arr.includes(s)) { // remove element from list if it exists (won't ever run, ideally)
            arr.splice(arr.indexOf(s), 1);
        }
        while (arr.length > 0) { // remove individual elements to deep purge event listeners
            let el = arr.pop(); // get element from end of list
            if (el.remove) { // if element is removeable (not a text node)
                el.remove(); // remove it
            }
        }
        s.innerHTML = ""; // clear out any remaining text nodes
    }
}

/**
 * disables the given elements
 * @param {String} message message to show
 * @param  {...(String | Element)} selectors list of css selectors or elements
 */
export function disable(message, ...selectors) {
    for (let s of selectors) {
        let el;
        if (typeof s == "string") {
            el = document.querySelector(s);
        } else {
            el = s;
        }
        el.setAttribute("disabled", message);
    }
}

/**
 * reenables the given elements
 * @param  {...(String  | Element)} selectors list of css selectors or elements
 */
export function enable(...selectors) {
    for (let s of selectors) {
        let el;
        if (typeof s == "string") { // if s is a string (css selector)
            el = document.querySelector(s);
        } else {
            el = s;
        }
        el.removeAttribute("disabled");
    }
}

/**
 * defines some custom HTML elements
 */
export const CUSTOM_ELEMENTS = (function () {
    function slider() { // input toggle slider
        customElements.define("input-slider", class extends HTMLElement {
            static observedAttributes = ["checked"];
            #checked = this.getAttribute("checked") == "true";
            constructor() {
                super();
                this.attachShadow({ mode: "open" });
                const CSS = new CSSStyleSheet(
                    new CSSRule(":host", {
                        "--scale": 1,
                        "--duration": "0.25s",
                        "--outerline-on": "#0f0",
                        "--outerline-off": "#f00",
                        "--innerline-on": "#0f0",
                        "--innerline-off": "#f00",
                        "--inner-shade-on": "#0f0",
                        "--inner-shade-off": "#f00",
                        "--outer-shade-on": "#fff",
                        "--outer-shade-off": "#fff",
                        "--show-text": 1,
                        "--on-text": "'ON'",
                        "--off-text": "'OFF'",
                        display: "inline-block",
                        userSelect: "none",
                    }),
                    new CSSRule(".slider", {
                        margin: "0px",
                        position: "relative",
                        width: "calc(48px * var(--scale))",
                        height: "calc(28px * var(--scale))",
                        display: "block",
                        border: "calc(2px * var(--scale)) solid var(--outerline-off)",
                        boxSizing: "border-box",
                        borderRadius: "calc(14px * var(--scale))",
                        transitionDuration: "var(--duration)",
                        backgroundColor: "var(--outer-shade-off)",
                        transitionProperty: "background-color, border-color",
                        overflow: "hidden",
                    }).addRules(
                        new CSSRule("div.dot", {
                            position: "absolute",
                            // boxSizing: "border-box",
                            borderRadius: "calc(10px * var(--scale))",
                            width: "calc(16px * var(--scale))",
                            height: "calc(16px * var(--scale))",
                            top: "calc(2px * var(--scale))",
                            left: "calc(2px * var(--scale))",
                            border: "calc(2px * var(--scale)) solid var(--innerline-off)",
                            backgroundColor: "var(--inner-shade-off)",
                            transitionProperty: "left, right, background-color, border-color",
                            transitionDuration: "var(--duration)",
                        }),
                        new CSSRule("&[checked=\"true\"]", {
                            borderColor: "var(--outerline-on)",
                            backgroundColor: "var(--outer-shade-on)",
                        }).addRules(
                            new CSSRule("div.dot", {
                                left: "calc(22px * var(--scale))",
                                borderColor: "var(--innerline-on)",
                                backgroundColor: "var(--inner-shade-on)",
                            }),
                        ),
                        new CSSRule("div.off-text, div.on-text", {
                            display: "flex",
                            height: "100%",
                            alignItems: "center",
                            position: "absolute",
                            fontSize: "calc(10px * var(--scale) * var(--show-text) / var(--show-text))",
                        }).addRules(new CSSRule("span::before", { display: "block" })),
                        new CSSRule("div.on-text", {
                            right: "calc(4px * var(--scale) + 100%)"
                        }).addRules(new CSSRule("span::before", { content: "var(--on-text)" })),
                        new CSSRule("div.off-text", {
                            left: "calc(4px * var(--scale) + 100%)"
                        }).addRules(new CSSRule("span::before", { content: "var(--off-text)" }),),
                    ),
                ).compile(true);
                this.shadowRoot.innerHTML = /*html*/`
                    <style>${CSS}</style>
                    <div class="slider" checked="${this.#checked}">
                        <div class="dot">
                            <div class="on-text"><span></span></div>
                            <div class="off-text"><span></span></div>
                        </div>
                    </div>
                `;
                this.addEventListener("click", () => {
                    let newChecked = !(this.shadowRoot.querySelector(".slider").getAttribute("checked") == "true");
                    this.shadowRoot.querySelector(".slider").setAttribute("checked", newChecked);
                    this.checked = newChecked;
                });
            }
            attributeChangedCallback(name, oldValue, newValue) {
                if (name == "checked") {
                    this.#checked = newValue.toString() == "true" && !!newValue;
                }
            }
            set checked(value) {
                this.dispatchEvent(new Event("change"));
                this.setAttribute("checked", value);
                this.#checked = !!value;
            }
            get checked() {
                return this.#checked;
            }
        });
    }
    function all() {
        slider();
    }
    return { all, slider };
})();

/**
 * stringifies the node tree of the given element
 * @param {HTMLElement} element element to stringify
 * @returns {string} string representation of the node tree
 */
export function stringifyNodeTree(element) {
    function traverse(el, indent, arr) {
        arr.push(`${indent}<${el.tagName}>`);
        el.childNodes.forEach(e => ((e.nodeType === Node.ELEMENT_NODE) ? traverse(e, indent + "    ", arr) : 0))
        arr.push(`${indent}</${el.tagName}>`);
        return arr;
    }
    return traverse(element, "", []).join('\n').replaceAll(/<([A-Z0-9\-]+)>([\n\r ]+)<\/\1>/g, function (match) {
        let tagName = match.match(/<([A-Z0-9\-]+)>/)[1];
        return `<${tagName}></${tagName}>`;
    }).toLowerCase();
}