import { flattenChildNodes } from "./arrays.js";
import { bulkElements } from "./bulkElements.js";
import { createElement } from "./createElement.js";

/**
 * adds a warning message to the specified elements
 * @param {String} str message to display
 * @param  {...any} selectors elements to add warning message to
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
 * @param  {...any} selectors elements to remove the warning message from
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
 * @param  {...any} selectors elements to add error message to
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
 * @param  {...any} selectors elements to remove the error message from
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
 * @param  {...(String|Element)} selectors list of css selectors or elements
 */
export function hide(...selectors) {
    bulkElements(...selectors).classList.add("hidden");
}

/**
 * shows the given elements by removing the class "hidden"
 * @param  {...(String|Element)} selectors list of css selectors or elements
 */
export function show(...selectors) {
    bulkElements(...selectors).classList.remove("hidden");
}

/**
 * clears the given elements
 * @param  {...(String|Element)} selectors list of css selectors or elements
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
 * @param  {...(String|Element)} selectors list of css selectors or elements
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
 * @param  {...(String|Element)} selectors list of css selectors or elements
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
 * defines some custom elements
 */
export const CUSTOM_ELEMENTS = (function () {
    function slider() { // input toggle slider
        customElements.define("input-slider", class extends HTMLElement {
            static observedAttributes = ["checked"];
            #checked = this.getAttribute("checked") == "true";
            constructor() {
                super();
                this.attachShadow({ mode: "open" });
                const CSS = /*css*/`
                    :host {
                        --scale: 1;
                        --duration: 0.25s;
    
                        --outerline-on: #0f0;
                        --outerline-off: #f00;
    
                        --innerline-on: #0f0;
                        --innerline-off: #f00;
    
                        --inner-shade-on: #0f0;
                        --outer-shade-on: #fff;
    
                        --inner-shade-off: #f00;
                        --outer-shade-off: #fff;
    
                        --show-text: 1;
                        --off-text: "OFF";
                        --on-text: "ON";
    
                        display: inline-block;
                        user-select: none;
                    }
                    
                    div.slider {
                        margin: 0px;
                        position: relative;
                        width: calc(48px * var(--scale));
                        height: calc(28px * var(--scale));
                        display: block;
                        border: calc(2px * var(--scale)) solid var(--outerline-off);
                        box-sizing: border-box;
                        border-radius: calc(14px * var(--scale));
                        transition-duration: var(--duration);
                        background-color: var(--outer-shade-off);
                        transition-property: background-color, border-color;
                        overflow: hidden;
                    }
                    
                    .slider div.dot {
                        position: absolute;
                        /* box-sizing: border-box; */
                        border-radius: calc(10px * var(--scale));
                        width: calc(16px * var(--scale));
                        height: calc(16px * var(--scale));
                        top: calc(2px * var(--scale));
                        left: calc(2px * var(--scale));
                        border: calc(2px * var(--scale)) solid var(--innerline-off);
                        background-color: var(--inner-shade-off);
                        transition-property: left, right, background-color, border-color;
                        transition-duration: var(--duration);
                    }
                    
                    .slider[checked="true"] {
                        border-color: var(--outerline-on);
                        background-color: var(--outer-shade-on);
                    }
    
                    .slider[checked="true"] div.dot {
                        left: calc(22px * var(--scale));
                        border-color: var(--innerline-on);
                        background-color: var(--inner-shade-on);
                    }
    
                    .slider div.off-text,
                    .slider div.on-text{
                        display: flex;
                        height: 100%;
                        align-items: center;
                        position: absolute;
                        font-size: calc(10px * var(--scale) * var(--show-text) / var(--show-text));
                    }
    
                    .slider div.off-text span::before {
                        display: block;
                        content: var(--off-text);
                    }
    
                    .slider div.on-text span::before {
                        display: block;
                        content: var(--on-text);
                    }
    
                    .slider div.on-text {
                        /* left: calc(2px * var(--scale)); */
                        right: calc(4px * var(--scale) + 100%);
                    }
    
                    .slider div.off-text {
                        /* right: calc(2px * var(--scale)); */
                        left: calc(4px * var(--scale) + 100%);
                    }
                `;
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