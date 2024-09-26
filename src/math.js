/**
 * rounds a number {v} to the nearest multiple of {t}
 * @param {number} v the value to round
 * @param {number} t the multiple to round to
 * @returns {number}
 */
export function roundf(v, t) {
    return Math.round(v / t) * t;
}
Math.roundf = roundf;

/**
 * proportionately maps a number from an input range to an output range
 * @param {Number} x value
 * @param {Number} inmin input range lower bound
 * @param {Number} inmax input range upper bound
 * @param {Number} outmin output range lower bound
 * @param {Number} outmax output range upper bound
 * @param {Boolean} cmp whether to clamp the input value to the input range
 * @returns {Number}
 */
export function map(x, inmin, inmax, outmin, outmax, cmp = false) {
    return ((cmp ? clamp(x, inmin, inmax) : x) - inmin) * (outmax - outmin) / (inmax - inmin) + outmin;
}
Math.map = map;

/**
 * clamps a number to a range\
 * \
 * if the number is outside the range, move it to the\
 * closest position inside the range, else do nothing
 * @param {Number} val value
 * @param {Number} min minimum of range
 * @param {Number} max maximum of range
 * @returns {Number} number clamped to range
 */
export function clamp(val, min, max) {
    // note:                      v------this------v   v----and this----v   are used to get the min/max values, even if min > max
    return Math.max(Math.min(val, Math.max(min, max)), Math.min(min, max));
}
Math.clamp = clamp;

/**
 * generate a random number within a range
 * @param {number} min min value of range
 * @param {number} max max value of range
 * @returns {number}
 */
export function rand(min, max) {
    return Math.random() * (max - min) + min;
}
Math.rand = rand;

/**
 * generate a range of numbers. functionally the same as python's range function
 * @param {number} start range start
 * @param {number} stop range end
 * @param {number} step step between numbers
 */
export function range(start, stop, step) {
    let args = [start, stop, step].filter(e => typeof e != "undefined");
    if (args.length == 1) return Math.range(0, args[0], 1);
    if (args.length == 2) return Math.range(args[0], args[1], 1);
    let arr = [];
    for (let i = args[0]; i < args[1]; i += args[2]) arr.push(i);
    return arr;
    // let obj = Object.fromEntries(arr);
    // obj[Symbol.iterator] = function* () {
    //     for (let i = 0; i < arr.length; i++) yield arr[i][0];
    // }
    // return new Proxy(obj, {
    //     ownKeys: () => arr.map(e => e[0] + ""),
    //     get: (target, prop) => {
    //         console.log("get", prop);
    //         return target[prop];
    //     },
    // });
}
Math.range = range;