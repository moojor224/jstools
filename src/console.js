import { extend } from "./utility.js";

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
        window.onunhandledrejection = function (e) { // catch some other things, IDK
            console.everything.push({ type: "promiseRejection", timeStamp: TS(), value: e.reason });
        }
        function hookLogType(logType) {
            const original = console[logType].bind(console); // save original function
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

/**
 * @typedef {Object} LoggerOptions
 * @property {("log" | "info" | "warn" | "error")} [type="log"] - The type of console method to use.
 * @property {string} [=""] - The base style to apply to the log message.
 * @property {Object} [prefix] - Options for the prefix.
 * @property {boolean} [prefix.enabled=false] - Whether to enable the prefix.
 * @property {string} [prefix.text="LOG"] - The text to use for the prefix.
 * @property {string} [prefix.style="background-color:#7c7c7c;color:white;border-radius:2px;padding:2px;"] - The style to apply to the prefix.
 * @property {Object} [brackets] - Options for the brackets.
 * @property {boolean} [brackets.enabled=false] - Whether to enable the brackets.
 * @property {string} [brackets.left="["] - The left bracket to use.
 * @property {string} [brackets.right="]"] - The right bracket to use.
 * @property {string} [brackets.style="color:#f0f;font-weight:bold;"] - The style to apply to the brackets.
 * @property {function} [shouldLog=() => true] - A function that returns whether the log should be made. Defaults to always logging.
 * @description
 */

/** @type {LoggerOptions} */
const defaultLoggerOptions = {
    type: "log",
    prefix: {
        enabled: false,
        text: "LOG",
        style: "background-color:#7c7c7c;color:white;border-radius:2px;padding:2px;"
    },
    baseStyle: "",
    brackets: {
        left: "[",
        right: "]",
        style: "color:#f0f;font-weight:bold;",
        enabled: false
    },
    shouldLog: () => true
}

/** @type {<T>(obj: T) => T} */
function copyObject(obj) {
    /** @type {ReturnType<typeof copyObject>} */
    const copy = {};
    for (const key in obj) {
        if (typeof obj[key] == "object" && obj[key] !== null) {
            copy[key] = copyObject(obj[key]);
        } else {
            copy[key] = obj[key];
        }
    }
    return copy;
}

/** @type {(source: any, target: any) => typeof source & typeof target} */
function deepExtend(source, target) {
    for (const key in source) {
        if (target[key] instanceof Object && key in target) {
            target[key] = deepExtend(source[key], target[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}
/** @type {<A>(a: Partia<A>) => A} */
function complete(a) {
    return a;
}
const regex = /(?<embed>%[oOdisfc])|(?<raw>(?:[^%]|%[^oOdisfc]|%$)+)/g;
export function customLogger(options = defaultLoggerOptions) {
    options = deepExtend(options, copyObject(defaultLoggerOptions));
    const {
        prefix: {
            enabled: enablePrefix,
            text: prefixText,
            style: prefixStyle
        },
        type,
        baseStyle,
        brackets: {
            enabled: enableBrackets,
            left: leftBracket,
            right: rightBracket,
            style: bracketsStyle
        },
        shouldLog
    } = complete(options);
    // pre-parse as much as possible to reduce overhead
    const builder = {
        prefix: enablePrefix ? `%c${prefixText}%c ` : "",
        prefixStyle: enablePrefix ? [prefixStyle, baseStyle] : [],
        leftBracket: enableBrackets ? `%c${leftBracket}%c` : "",
        rightBracket: enableBrackets ? `%c${rightBracket}%c` : "",
        bracketStyle: enableBrackets ? [bracketsStyle, baseStyle] : []
    };
    function parse(args) {
        if (typeof args[0] !== "string") args.unshift(builder.prefix);
        else args[0] = builder.prefix + args[0];

        /** @type {string} */
        const first_arg = args.shift();
        const rest_args = builder.prefixStyle.concat([...args]);
        const matches = [...first_arg.matchAll(regex)];
        /** @type {string[]} */
        const first_arg_result= [];
        /** @type {any[]} */
        const rest_arg_result = [];

        matches.forEach((match) => {
            const { embed, raw } = match.groups;
            if (embed) {
                const has_next_embedded = rest_args.length > 0;
                const next_embed = rest_args.shift();
                if (embed === "%c") {
                    first_arg_result.push(embed);
                    if (has_next_embedded) {
                        rest_arg_result.push(next_embed);
                    }
                } else {
                    first_arg_result.push(builder.leftBracket, embed, builder.rightBracket);
                    rest_arg_result.push(...builder.bracketStyle.concat([next_embed]).concat(builder.bracketStyle));
                }
            } else if (raw) {
                first_arg_result.push(raw);
            }
        });

        const header = first_arg_result.join("");
        const others = rest_arg_result.concat(rest_args);
        if (first_arg_result.length === 0) { return others; }
        return ["%c" + header].concat([baseStyle], others);
    }
    /** @type {(...args: Parameters<typeof console.log>) => void} */
    return function (...args) {
        if (!shouldLog()) return;
        console[type](...parse(args));
    }
}