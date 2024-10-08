/**
 * takes in an object and returns a flattened array of all it's children
 * @param {object} arr object to flatten
 * @returns {object[]} array of all children
 */
export function flattenChildren(arr) {
    let children = [];
    if (arr.children) {
        children = arr.children;
    }
    return [arr, (children.flatMap((e) => flattenChildren(e)) || [])].flatMap(e => e);
}

/**
 * takes in an HTMLElement and returns an array of all it's descendants
 * @param {HTMLElement} el element to flatten
 * @returns {HTMLElement[]} array of all children
 */
export function flattenChildNodes(el) {
    return [el, ...([...el.childNodes].flatMap((e) => flattenChildNodes(e)) || [])];
}

/**
 * generates a 2d array
 * @param {Number} num the minimum number of items
 * @returns {Array<Array<any>>}
 */
export function rectangle(num) {
    let height = Math.ceil(Math.sqrt(num));
    let width = height;
    while (height * width - width >= num) {
        height--;
    }
    let arr = new Array(height).fill(0).map(e => new Array(width));
    return arr;
}

/**
 * reshapes a 1d array into a 2d array with the given length and width
 * @param {Array} arr the input array
 * @param {number} length 
 * @param {number} width 
 * @returns {Array<Array<any>>}
 */
export function reshape(arr, length, width) {
    arr = [...arr]; // clone array
    let result = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < length; y++) {
            if (result[x] == undefined) {
                result[x] = [];
            }
            result[x].push(arr.shift());  // change to pop to rotate array by 180°
        }
    }
    return result;
}

/**
 * interleaves arrays
 * @param {Boolean} fill whther to fill arrays with null to match longest array's length
 * @param  {...any} arrays arrays to interleave
 * @returns {any[]} interleaved arrays
 */
export function interleaveArrays(fill, ...arrays) {
    if (fill) {
        let max = Math.max(...arrays.map(e => e.length)); // get max length of all arrays
        arrays = arrays.map(arr => [...arr, ...new Array(max - arr.length).fill(null)]); // fill all arrays with null so that they're all the same length
    }
    let result = [];
    while (arrays.filter(e => e.length > 0).length > 0) { // while at least one array still has at least one item in it
        arrays.forEach(arr => { // loop through each array
            if (arr.length > 0) result.push(arr.shift()); // remove first element from array and add it to result array
        });
    }
    return result;
}

Array.prototype.unique = function () {
    return Array.from(new Set(this));
}