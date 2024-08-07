/**
 * waits for an element that matches the css selector to load, then calls the callback
 * @param {string} query css selector to wait for
 * @param {Function} callback callback function to run when the element is found
 * @param {boolean} stopAfterFound whether to stop looking after the element is found
 * @param {Element} [element = document] parent element to look within -  defaults to document
 */
export function waitForKeyElements(query, callback, stopAfterFound, element) {
    let o, r;

    (o = void 0 === element ? $(query) : $(element).contents().find(query)) &&
        o.length > 0
        ? ((r = !0),
            o.each(function () {
                let e = $(this);
                e.data("alreadyFound") ||
                    false ||
                    (callback(e) ? (r = false) : e.data("alreadyFound", true));
            }))
        : (r = false);
    let l = waitForKeyElements.controlObj || {},
        i = query.replace(/[^\w]/g, "_"),
        c = l[i];
    r && stopAfterFound && c
        ? (clearInterval(c), delete l[i])
        : c ||
        ((c = setInterval(function () {
            waitForKeyElements(query, callback, stopAfterFound, element);
        }, 1000)),
            (l[i] = c));
    waitForKeyElements.controlObj = l;
} //wait for key elements
