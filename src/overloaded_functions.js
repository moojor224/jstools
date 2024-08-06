
// this library is kinda janky, so it may not work in all cases
// I'm adding more and more conditionals to adjust for edge cases

function getPath(o) { // make array of object's prototypes all the way up to Object.prototype
    const path = [];
    while (o) {
        path.unshift(o);
        o = Object.getPrototypeOf(o);
    }
    return path;
}

function getCommonAncestor(x, y) { // check if two objects have any common prototypes in their prototype tree
    const xPath = getPath(x);
    const yPath = getPath(y);
    const steps = Math.min(xPath.length, yPath.length);

    for (let i = 0; i < steps; i++) {
        if (xPath[i] !== yPath[i]) return (xPath[i - 1]?.prototype || xPath[i - 1]);
    }
}

export class Overload {
    static Rest = class {
        type = null;
        constructor(type) {
            this.type = type;
        }
    }

    /**
     * creates a new Overloaded function
     * @param {Function} defaultCallback callback function
     * @returns {this}
     */
    constructor(defaultCallback = (...args) => console.log("no suitable callback for arguments:", args)) {
        if (defaultCallback === undefined) {
            defaultCallback = function (...args) {
                console.log("no suitable overload found for arguments:", args);
            }
        }
        this.defaultCallback = defaultCallback;
        this.overloads = [];
        let target = this;
        return new Proxy(function () { }, {
            get: function (t, prop) {
                return target[prop];
            },
            set: function (t, prop, value) {
                target[prop] = value;
                return true;
            },
            apply: function (t, thisArg, argumentsList) {
                return target.call(...argumentsList);
            }
        });
    }

    /**
     * 
     * @param {Function} callback overload function to call if arguments match types
     * @param  {...any} types types to overload
     */
    addOverload(callback, ...types) {
        types = types.flat(Infinity);
        let options = {};
        if (types.includes(Object)) {
            options.allowObject = true;
        }
        this.overloads.push({
            options,
            callback,
            types
        });
    }

    call(...args) {
        function hasRest(c) {
            return c.types[c.types.length - 1] instanceof Overload.Rest;
        }
        function compareType(x, y, o) {
            let ancestor = getCommonAncestor(x, y);
            var a;
            return !!(
                ( // let the spaghetti begin
                    (x instanceof (y instanceof Overload.Rest ? y.type : y)) && ( //  if x instance of (if y is rest, y.type, else y)
                        (o.options.allowObject && (y == Object)) || // if allowObject and y in Object
                        (!o.options.allowObject && (y != Object)) // if !allowObject and y is not Object
                    ) && (
                        ((typeof x == "function") && (y == Function)) || // both x and y are functions
                        ((typeof x != "function") && (y != Function)) // both x and y are not functions
                    )
                ) ||
                (typeof x == (y instanceof Overload.Rest ? y.type : y).name.toLowerCase()) || // typeof x is equal to y.name.toLowerCase()
                (o.options.allowObject && (ancestor === Object.getPrototypeOf({}))) || // if allowObject and common ancestor prototype is Object.prototype
                (
                    (typeof (a = (!o.options.allowObject && (ancestor != Object.getPrototypeOf({})) && ancestor)) === "boolean") && // if type is Boolean and a is true (this edge case is only needed if the argument to check is true, not false)
                    a == true
                ) ||
                (
                    typeof y == "string" && // if the type is a string
                    typeof x == y.toLowerCase().trim() // and typeof x is equal to that string
                )
            ); // regretti spaghetti
        }
        const candidates = this.overloads.filter(overload => {
            if (args.length == overload.types.length && !hasRest(overload)) { // types array is static in length, and number of argments matches length of types array
                let arr = overload.types.map((type, index) => compareType(args[index], type, overload));
                return !arr.includes(false); // if array is entirely true, return true, else return false
            } else if (hasRest(overload)) { // types list can be any length >= given length
                // has Rest parameter
                let types = Object.assign([], overload.types); // copy array of types
                let rest = types.pop(); // get rest parameter
                let unrestArgs = args.splice(0, types.length); // remove all arguments up to rest parameter
                let unrestMatch = types.map((t, n) => compareType(unrestArgs[n], t, overload)); // check if unrest args match with unrest types
                if (unrestMatch.includes(false)) { // if any don't match, return false
                    return false;
                }
                return !(args.map(e => compareType(e, rest.type, overload)).includes(false)); // check if the remaining arguments match the rest parameter type
            }
            return false;
        });
        let funcToCall;
        // console.log("candidates", candidates);
        if (funcToCall = candidates.find(e => !hasRest(e))) { } // find an overload that doesn't use rest parameters (exact parameter list match)
        else if (funcToCall = candidates.find(hasRest)) { } // find the first overload that uses a rest parameter
        else { funcToCall = { callback: this.defaultCallback }; } // no valid overloads found (no exact matches for non-rest overloads, and no valid rest overloads)

        return funcToCall.callback(...args); // call the overloaded function
    }
}

(function example() { // example usage
    let loaded = new Overload();
    loaded.addOverload(function (el, count) { console.log(`repeat the element ${count} times:`, new Array(count).fill(el)); }, Element, Number); // accepts an Element and a Number
    loaded.addOverload(function (...args) { console.log("many numbers:", ...args); return args.reduce((a, b) => a + b, 0); }, new Overload.Rest(Number)); // Accepts any amount of numbers
    loaded.addOverload(function (...args) { console.log("one number:", ...args); }, Number); // accepts one number
    loaded.addOverload(function (...args) { console.log("string:", ...args); }, String); // accepts one string
    loaded.addOverload(function (...args) { console.log("two numbers:", ...args); }, Number, Number); // accepts 2 numbers
    loaded.addOverload(function (...args) { console.log("rest:", ...args); }, Overload.Rest); // accepts one instance of the class "Rest"
    loaded.addOverload(function (...args) { console.log("object:", ...args); }, Object); // accepts one object
    loaded.addOverload(function (...args) { console.log("function:", ...args); }, Function); // accepts one function

    // call the overloaded function with various types of arguments
    loaded(document.body, 7);
    loaded(3);
    loaded({ a: 1, b: 2 });
    loaded("hello world");
    loaded(console.log);
    loaded(new Overload.Rest(Number));
});