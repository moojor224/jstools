/**
 * takes in an object and returns a flattened array of all it's children
 * @param {object} arr object to flatten
 * @returns {object[]} array of all children
 */
export function flattenChildren(arr) {
    return [arr, ...(arr.children?.flatMap((e) => flattenChildren(e)) || [])];
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