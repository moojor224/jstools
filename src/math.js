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
    return Math.max(Math.min(val, Math.max(min, max)), Math.min(min, max));
}