
import override from "./src/_node_overrides.js";
override();
/**
* one-time definition methods
*/
(function () {
    // loop through all HTML...Element prototypes and add the add function
    // Object.getOwnPropertyNames(window).filter(e => e.startsWith("HTML") && e.endsWith("Element")).forEach(e => {
    //     if (window[e].prototype.add !== add) {
    //         window[e].prototype.add = add
    //     }
    // });

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
})();

// initailize devtools formatters array if it doesn't exist
if (!Array.isArray(window.devtoolsFormatters)) {
    console.log("initialized devtoolsFormatters");
    window.devtoolsFormatters = [];
}

export { flattenChildNodes, flattenChildren, interleaveArrays, rectangle, reshape } from "./src/arrays.js";
export { captureConsole } from "./src/captureConsole.js";
export { CSSColors, Color, getColor, getContrastColor, gradient, listAllColorsOnPage, rgbMix } from "./src/colors.js";
export { createElement } from "./src/createElement.js";
export { jst_CSSRule, jst_CSSStyleSheet } from "./src/CSS.js";
export { consoleButton } from "./src/devtoolsFormatters.js";
export { CUSTOM_ELEMENTS, clear, clearError, clearWarn, disable, enable, error, hide, show, warn } from "./src/elements.js";
export { clamp, map, roundf } from "./src/math.js";
export { Option, Section, Settings } from "./src/settings.js";
export { advancedDynamicSort, dynamicSort } from "./src/sorting.js";
export { tabColor } from "./src/tabColor.js";
export { BULK_OPERATIONS, copyObject, createEnum, extend, getValueOrDefault, isAsync, lockValue, logAndReturn, logFormatted, makeTemplate, stringify, timeConversions, toHTMLEntities } from "./src/utility.js";
export { waitForKeyElements } from "./src/waitForKeyElements.js";
