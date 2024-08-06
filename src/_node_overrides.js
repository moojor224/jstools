/** @type {import("./types.d.ts")} */
export default function () { // overrides for nodejs
    if (typeof window != "undefined") {
        return; // running in browser, or overrides have already been applied
    }
    /**
     * @type {() => ProxyConstructor}
     */
    function proxy() { // create a recursive dummy proxy object
        let t = () => { };
        return new Proxy(t, {
            get: function (target, prop) {
                if (!(prop in target)) return proxy();
                return target[prop];
            },
            set: function (target, prop, value) {
                target[prop] = value;
                return true;
            },
            apply: function (target, thisArg, argumentsList) {
                return proxy();
            },
            construct: function (target, argumentsList, newTarget) {
                return proxy();
            }
        });
    }
    globalThis.window = proxy();
    globalThis.HTMLElement = proxy();
    globalThis.Element = proxy();
    globalThis.getComputedStyle = proxy();
    globalThis.document = proxy();
    globalThis.CSSStyleSheet = proxy();
    if (typeof navigator == "undefined") {
        globalThis.navigator = proxy();
        navigator.userAgent = "Node.js";
    }
};