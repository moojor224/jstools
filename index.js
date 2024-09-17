
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
})();

// initailize devtools formatters array if it doesn't exist
if (!Array.isArray(window.devtoolsFormatters)) {
    console.log("initialized devtoolsFormatters");
    window.devtoolsFormatters = [];
}

export { flattenChildNodes, flattenChildren, interleaveArrays, rectangle, reshape } from "./src/arrays.js";
export { bulkElements } from "./src/bulkElements.js";
export { captureConsole } from "./src/captureConsole.js";
export { CSSColors, Color, getColor, getContrastColor, gradient, listAllColorsOnPage, rgbMix } from "./src/colors.js";
export { createElement } from "./src/createElement.js";
export { jst_CSSRule, jst_CSSStyleSheet } from "./src/CSS.js";
export { consoleButton } from "./src/devtoolsFormatters.js";
export { CUSTOM_ELEMENTS, clear, clearError, clearWarn, disable, enable, error, hide, show, stringifyNodeTree, warn } from "./src/elements.js";
export { clamp, map, rand, roundf } from "./src/math.js";
export { Overload } from "./src/overloaded_functions.js";
export { Option, Section, Settings } from "./src/settings.js";
export { advancedDynamicSort, dynamicSort, makeTableSortable } from "./src/sorting.js";
export { tabColor } from "./src/tabColor.js";
export {
    BULK_OPERATIONS, constant, copyObject, createDummyEnum, createEnum, createTypedEnum,
    extend, getBrowserType, getStack, getValueOrDefault, hashScript, isAsync, lockValue,
    logAndReturn, logFormatted, makeTemplate, objectToJSONML, prismToJSONML,
    stringify, timeConversions, toHTMLEntities, wrapInQuotes
} from "./src/utility.js";

