
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
export { Color, CSSColors, getColor, getContrastColor, gradient, listAllColorsOnPage, rgbMix } from "./src/colors.js";
export { captureConsole, customLogger } from "./src/console.js";
export { createElement } from "./src/createElement.js";
export { cssObjToString, jst_CSSRule, jst_CSSStyleSheet } from "./src/CSS.js";
export { consoleButton } from "./src/devtoolsFormatters.js";
export { clear, clearError, clearWarn, CUSTOM_ELEMENTS, disable, enable, error, hide, show, stringifyNodeTree, warn } from "./src/elements.js";
export { React, ReactDOM } from "./src/lib/react_reactdom.js";
export { clamp, map, rand, range, roundf } from "./src/math.js";
export { Overload } from "./src/overloaded_functions.js";
export { Option, Section, Settings } from "./src/settings.js";
export { advancedDynamicSort, dynamicSort, makeTableSortable } from "./src/sorting.js";
export { tabColor } from "./src/tabColor.js";
export {
    BULK_OPERATIONS, constant, copyObject, createDummyEnum, createEnum, createTypedEnum,
    extend, getBrowserType, getStack, getValueOrDefault, hashScript, isAsync, lockValue,
    logAndReturn, logFormatted, makeTemplate, objectToJSONML, objectToTable, prismToJSONML,
    stringify, timeConversions, toHTMLEntities, wrapInQuotes
} from "./src/utility.js";

