// use this file to test if any imports are broken
import * as jstools from "./index.js";
import { logFormatted } from "./index.js";
logFormatted({a: 1});

Object.keys(jstools).forEach(key => {
    if (typeof jstools[key] === "function") {
        console.log(`testing ${key}`);
        try {
            jstools[key]([]);
        } catch (err) {
            try {
                new jstools[key]("");
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        console.log(`skipping ${key}`, jstools[key]);
    }
});