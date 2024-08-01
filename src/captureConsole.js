
/**
 * sets `console.everything` to an array of the console's history\
 * run this before using any console logging functions in order to capture everything
 */
export function captureConsole() {
    if (console.everything === undefined) {
        console.everything = [];
        let TS = _ => new Date().toLocaleString("sv", { timeZone: 'UTC' }) + "Z"; // timestamp function
        window.onerror = function (error, url, line) { // catches all console errors, includes those not made by console.error
            console.everything.push({ type: "exception", timeStamp: TS(), value: { error, url, line } });
            return false;
        }
        window.onunhandledrejection = function (e) { // catch some other things, idk
            console.everything.push({ type: "promiseRejection", timeStamp: TS(), value: e.reason });
        }
        function hookLogType(logType) {
            const original = console[logType].bind(console); // save orginal function
            console["original" + logType] = original;
            return function (...args) {
                let info = new Error();
                // original.apply(console, [{ info }]);
                console.everything.push({
                    type: logType,
                    timeStamp: TS(),
                    args: Array.from(args),
                    trace: info.stack.trim().split("\n").pop(),
                }); // add object to console.everything
                original.apply(console, args); // log message to console
            }
        }
        ['log', 'error', 'warn', 'debug'].forEach(logType => { // hook  each log type
            console[logType] = hookLogType(logType)
        });
        let states = new Map();
        console.saveState = function saveState(id = 0) {
            let everything = [...console.everything];
            states.set(id, everything);
        }
        console.restore = function restore(id = 0) {
            let everything = states.get(id) || [];
            console.everything = [...everything];
            console.clear();
            // let max = Math.max(...console.everything.map(e => e.trace.length));
            console.everything.forEach(function (log) {
                let original;
                if (original = console["original" + log.type]) {
                    original.apply(console, [...log.args/* , log.trace.padStart(max + 10, " ") + ", ", log.timeStamp */]);
                } else {
                    console.originalerror.apply(console, [...log.args]);
                }
            });
        }
    }
}