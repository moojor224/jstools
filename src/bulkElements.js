// import { clear } from "./jstools.js";

const isSelectorValid = (selector) => {
    try {
        document.createDocumentFragment().querySelector(selector)
    } catch {
        return false;
    }
    return true;
}
/**
 * combines a list of selectors or elements into a single object that functions mostly like a single element
 * @param  {...any} selectors list of selectors or elements
 * @returns {HTMLElement}
 */
export function bulkElements(...selectors) {
    let elements = []; // arraay of elements
    function convertToArray(s) { // recursively flatten arrays, NodeLists, single elements, and strings
        s.forEach(e => {
            if (typeof e == "string") { // array element is a CSS selector
                try {
                    elements.push(...document.querySelectorAll(e))
                } catch (err) {
                    console.error(e, "is not a valid selector");
                }
            } else if (e instanceof Element) { // array element is a single element
                elements.push(e);
            } else if (e instanceof NodeList || Array.isArray(e)) { // array element is an array or NodeList
                convertToArray(Array.from(e));
            } else { // array element is not a selector, element, array, or NodeList
                console.error(e, "is not a valid selector or element");
            }
        });
    }
    convertToArray(selectors);
    function makeProxy(property) {
        return new Proxy({}, {
            get: function (target, prop) {
                return elements.map(e => e[property][prop]);
            },
            set: function (target, prop, value) {
                elements.forEach(e => e[property][prop] = value);
            },
        });
    }
    return {
        _elements: elements,
        classList: {
            add: function (...classes) {
                elements.forEach(e => e.classList.add(...classes));
            },
            remove: function (...classes) {
                elements.forEach(e => e.classList.remove(...classes));
            },
        },
        style: makeProxy("style"),
        get innerHTML() {
            return elements.map(e => e.innerHTML);
        },
        set innerHTML(value) {
            elements.forEach(e => e.innerHTML = value);
        },
        clear: function () {
            elements.forEach(e => e.innerHTML = "");
        }
    };
}