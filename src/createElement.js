/**
 * picks out all properties from an object that start with a specified string
 * @template Keys
 * @template {string} Needle
 * @typedef {(Keys extends `${Needle}${infer _X}` ? Keys : never)} FilterStartingWith
 * @usage FilterStartingWith<keyof Type, "needle">
 */
/**
 * picks out all function property names from an object
 * @template T
 * @typedef {{ [K in keyof T]: T[K] extends Function ? K : never }[keyof T]} FunctionPropertyNames
 * @usage FunctionPropertyNames<Type>
 */
/**
 * picks out all configurable properties from an object\
 * this is used to get all non-function prperties from an element class, including on\<event> listeners
 * @template T
 * @typedef {Pick<T, keyof Omit<T, FunctionPropertyNames<T>>> & Pick<T, FilterStartingWith<keyof T, "on">>} ElementProps
 */


/**
 * creates a new element with the specified tag name and properties
 * @type {<Tag extends keyof HTMLElementTagNameMap>(tagName: Tag, options?: ElementProps<HTMLElementTagNameMap[Tag]>) => HTMLElementTagNameMap[Tag]}
 * @param {string} tagName tag name of the element to create
 * @param {ElementProps<HTMLElementTagNameMap[Tag]>} options properties to set on the element
 */
export function createElement(tag, data = {}) {
    // {
    //     // minified createElement
    //     // @ts-format-ignore-region
    //     let createElement = (t,D)=>(p=e=>typeof e,c=(T,d=
    //     {})=>(T=p(T)[1]=="t"?document.createElement(T):T,
    //     Object.keys(d).map(e=>(p(d[e])[0]=="o"?c(T[e]||
    //     (T[e]={}),d[e]):(T instanceof window.Element?(e[s=
    //     "substring"](0,2)=="on"&&p(d[e])[0]=="f"?T.addEventListener
    //     (e[s](2),d[e]):T[e]=d[e]):(T[e]=d[e])))),T),c(t,D))
    //     // @ts-format-ignore-endregion
    // }
    tag = typeof tag === "string" ? document.createElement(tag) : tag; // convert string to HTMLElement
    Object.keys(data).forEach((e) => { // loop through object properties
        if (typeof data[e] === "object" && !(e == "ref" && "current" in data[e] && tag instanceof HTMLElement)) { // if value is object, recurse
            createElement(tag[e] || (tag[e] = {}), data[e]);
        } else {
            if (tag instanceof window.Element) { // if tag is an html element
                if (e.substring(0, 2) == "on" && typeof data[e] == "function") { // if property is an event listener
                    tag.addEventListener(e.substring(2), data[e]); // add event listener
                } else {
                    tag[e] = data[e]; // else, set property
                }
            } else {
                tag[e] = data[e]; // else, set property
            }
        }
    });
    return tag; // return result
}