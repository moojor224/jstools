import { flattenChildNodes } from "./arrays.js";
import { bulkElements } from "./bulkElements.js";
import { createElement } from "./createElement.js";
import _node_overrides from "./_node_overrides.js";
import { jst_CSSRule as CSSRule, jst_CSSStyleSheet as CSSStyleSheet } from "./CSS.js";
import { React } from "./lib/react_reactdom.js";
_node_overrides();

/**
 * appends any number of objects to an HTMLElement
 * @param  {...Element} args an array of objects to be added to the parent element
 * @returns {typeof this}
 * @memberof HTMLElement
 * @function external:HTMLElement#add
 * @example
 * createElement("table").add(
 *      createElement("tr").add(
 *          createElement("td", {innerHTML: "col 1"}),
 *          createElement("td", {innerHTML: "col 2"}),
 *          createElement("td", {innerHTML: "col 3"})
 *      )
 * );
 * // results in:
 * <table>
 *     <tr>
 *         <td>col 1</td>
 *         <td>col 2</td>
 *         <td>col 3</td>
 *     </tr>
 * </table>
 */
Object.defineProperty(HTMLElement.prototype, "add", {
    value: function (...args) {
        args.forEach(elem => {
            if (typeof elem == "string") {
                this.insertAdjacentHTML("beforeend", elem); // insert as raw html (preserves event listeners)
            } else {
                this.append(elem); // append element
            }
        });
        return this;
    }
});

/** HTMLElement.isVisible will return true if the element is currently on screen */
Object.defineProperty(HTMLElement.prototype, "isVisible", {
    get: function () {
        if (this === document.documentElement) { // node is the root node
            return true;
        }
        if (!this.parentNode) { // node has no parent (not attached to page)
            return false;
        }
        let style = window.getComputedStyle ? window.getComputedStyle(this) : this.currentStyle; // get current computed style
        return !(
            style.display === "none" || // node is hidden via css
            style.visibility === "hidden" ||
            style.opacity == "0"
        ) &&
            this.parentNode.isVisible && // make sure parent node is visible
            (function () {
                let bounds = this.getBoundingClientRect();  // get position of element
                let html = document.documentElement, body = document.body; // get html and body elements
                let viewport = { // get viewport dimensions and position
                    width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
                    height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                };
                return bounds.left >= 0 && // check if element is within viewport
                    bounds.top >= 0 &&
                    bounds.right <= viewport.width &&
                    bounds.bottom <= viewport.height;
            }).bind(this)();
    }
});

(function () {
    /**
     * @typedef {GlobalEventHandlersEventMap}
     * this list is taken from the typescript type definition for the above type
     */
    const eventTypes = {
        abort: "Abort", animationcancel: "AnimationCancel", animationend: "AnimationEnd", animationiteration: "AnimationIteration",
        animationstart: "AnimationStart", auxclick: "AuxClick", beforeinput: "BeforeInput", beforetoggle: "BeforeToggle",
        blur: "Blur", cancel: "Cancel", canplay: "CanPlay", canplaythrough: "CanPlayThrough", change: "Change", click: "Click",
        close: "Close", compositionend: "CompositionEnd", compositionstart: "CompositionStart", compositionupdate: "CompositionUpdate",
        contextlost: "ContextLost", contextmenu: "ContextMenu", contextrestored: "ContextRestored", copy: "Copy", cuechange: "CueChange",
        cut: "Cut", dblclick: "DblClick", drag: "Drag", dragend: "DragEnd", dragenter: "DragEnter", dragleave: "DragLeave", dragover: "DragOver",
        dragstart: "DragStart", drop: "Drop", durationchange: "DurationChange", emptied: "Emptied", ended: "Ended", error: "Error", focus: "Focus",
        focusin: "FocusIn", focusout: "FocusOut", formdata: "FormData", gotpointercapture: "GotPointerCapture", input: "Input", invalid: "Invalid",
        keydown: "KeyDown", keypress: "KeyPress", keyup: "KeyUp", load: "Load", loadeddata: "LoadedData", loadedmetadata: "LoadedMetadata",
        loadstart: "LoadStart", lostpointercapture: "LostPointerCapture", mousedown: "MouseDown", mouseenter: "MouseEnter", mouseleave: "MouseLeave",
        mousemove: "MouseMove", mouseout: "MouseOut", mouseover: "MouseOver", mouseup: "MouseUp", paste: "Paste", pause: "Pause", play: "Play",
        playing: "Playing", pointercancel: "PointerCancel", pointerdown: "PointerDown", pointerenter: "PointerEnter", pointerleave: "PointerLeave",
        pointermove: "PointerMove", pointerout: "PointerOut", pointerover: "PointerOver", pointerup: "PointerUp", progress: "Progress",
        ratechange: "RateChange", reset: "Reset", resize: "Resize", scroll: "Scroll", scrollend: "ScrollEnd", securitypolicyviolation: "SecurityPolicyViolation",
        seeked: "Seeked", seeking: "Seeking", select: "Select", selectionchange: "SelectionChange", selectstart: "SelectStart", slotchange: "SlotChange",
        stalled: "Stalled", submit: "Submit", suspend: "Suspend", timeupdate: "TimeUpdate", toggle: "Toggle", touchcancel: "TouchCancel",
        touchend: "TouchEnd", touchmove: "TouchMove", touchstart: "TouchStart", transitioncancel: "TransitionCancel", transitionend: "TransitionEnd",
        transitionrun: "TransitionRun", transitionstart: "TransitionStart", volumechange: "VolumeChange", waiting: "Waiting", webkitanimationend: "WebkitAnimationEnd",
        webkitanimationiteration: "WebkitAnimationIteration", webkitanimationstart: "WebkitAnimationStart", webkittransitionend: "WebkitTransitionEnd", wheel: "Wheel",
    };
    Object.entries(eventTypes).forEach(([key, value]) => {
        let val = "on" + value;
        eventTypes[key] = val;
        eventTypes[value] = val;
        eventTypes["on" + key] = val;
        eventTypes[val] = val;
    });
    function getStyles(el) {
        let styles = {};

        if (!el || !el.style || !el.style.cssText) {
            return styles;
        }

        /** @param {string} str */
        function camelCase(str) {
            return str.replace(/(?:^|[-])(\w)/g, function (a, c) {
                if (a[0] === '-') {
                    c = c.toUpperCase();
                }
                return c ? c : '';
            });
        }

        let style = el.style.cssText.split(';').map(e => e.trim());

        for (let i = 0; i < style.length; ++i) {
            let rule = style[i].trim();

            if (rule) {
                let keyVal = rule.split(':');
                let key = camelCase(keyVal.shift().trim());
                styles[key] = keyVal.join(':').trim();
            }
        }

        return styles;
    }
    const BLACKLIST_TAGS = ["style", "script", "meta"];
    Object.defineProperty(HTMLElement.prototype, "toReactElement", {
        value: function (l = []) {
            /** @type {import("./types").EventListener[]} */
            let listeners = l;
            /** @type {HTMLElement} */
            let el = this;
            if (BLACKLIST_TAGS.includes(el.tagName.toLowerCase())) return null;
            let props = {};
            for (let attr of el.attributes) {
                if (el.tagName.toLowerCase() == "details" && attr.name == "open") {
                    props.open = true;
                    console.log("open", el, props);
                } else {
                    props[attr.name] = attr.value;
                }
            }
            if (Array.isArray(listeners)) {
                listeners.filter(e => e[0] == el).forEach(e => {
                    let [type, callback] = e[1];
                    if (type in eventTypes) {
                        props[eventTypes[type]] = callback;
                    } else {
                        props["on" + type[0].toUpperCase() + type.slice(1)] = callback;
                    }
                });
            }
            if ("style" in props) {
                delete props.style;
                props.style = getStyles(el);
            }
            if ("ref" in el) {
                props.ref = el.ref;
            }
            let children = Array.from(el.childNodes).map(e => {
                if (e instanceof HTMLElement) {
                    return e.toReactElement(listeners);
                } else {
                    return e.textContent;
                }
            }).filter(e => e !== null);
            if (children.length == 0) children = undefined;
            return React.createElement(el.tagName.toLowerCase(), props, children);
        }
    });
})();

// Adds polyfills for missing browser features.
if (!Element.prototype.computedStyleMap && globalThis.getComputedStyle != undefined) {
    Element.prototype.computedStyleMap = function () {
        return window.getComputedStyle(this);
    }
}

/**
 * adds a warning message to the specified elements
 * @param {string} str message to display
 * @param  {...(string | HTMLElement)} selectors elements to add warning message to
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
 * @param  {...(string | HTMLElement)} selectors elements to remove the warning message from
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
 * @param {string} str message to display
 * @param  {...(string | HTMLElement)} selectors elements to add error message to
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
 * @param  {...(string | HTMLElement)} selectors elements to remove the error message from
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
 * @param  {...(string | Element)} selectors list of css selectors or elements
 */
export function hide(...selectors) {
    bulkElements(...selectors).classList.add("hidden");
}

/**
 * shows the given elements by removing the class "hidden"
 * @param  {...(string | Element)} selectors list of css selectors or elements
 */
export function show(...selectors) {
    bulkElements(...selectors).classList.remove("hidden");
}

/**
 * clears the given elements
 * @param  {...(string | Element)} selectors list of css selectors or elements
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
 * @param {string} message message to show
 * @param  {...(string | Element)} selectors list of css selectors or elements
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
 * @param  {...(string  | Element)} selectors list of css selectors or elements
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