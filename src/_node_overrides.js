/** @type {import("./types.d.ts")} */
export default function () { // overrides for nodejs
    /**
     * @type {() => ProxyConstructor}
     */
    function proxy() { // create a recursive dummy proxy object
        let t = () => { };
        return new Proxy(t, {
            get: function (target, prop) {
                if (typeof target[prop] == "undefined") return proxy();
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
    if (typeof window === "undefined") {
        globalThis.window = proxy();
    }
    if (typeof HTMLElement === "undefined") {
        globalThis.HTMLElement = proxy();
    }
    if (typeof Element === "undefined") {
        globalThis.Element = proxy();
    }
    if (typeof getComputedStyle === "undefined") {
        globalThis.getComputedStyle = () => ({});
    }
    if (typeof document === "undefined") {
        globalThis.document = {
            body: { append: () => 0 },
            createElement: function () {
                return { remove: () => 0 }
            }
        };
    }
    if (typeof CSSStyleSheet === "undefined") {
        globalThis.CSSStyleSheet = proxy();
    }
};