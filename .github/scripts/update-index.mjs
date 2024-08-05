// console.log("\x1b[31mTHIS IS A TEST MESSAGE TO MAKE SURE THIS FILE RUNS");
console.clear();
import * as fs from "fs";
import * as path from "path";
import * as jstools from "../../index.js"
import { Parser } from "acorn";
import { parse } from "comment-parser";

let indexPath = path.resolve("./index.html");

let srcFiles = fs.readdirSync(path.resolve("./src")).map(e => path.parse(path.resolve("./src/", e)));
let fileBlacklist = ["_node_overrides.js", "emmet.js", "prism.js", "types.d.ts"];
fileBlacklist.forEach(bl => {
    srcFiles = srcFiles.filter(e => e.base != bl);
});
srcFiles = srcFiles.map(e => path.resolve(e.dir, e.base));
// console.log(srcFiles);
try {
    let { dynamicSort } = jstools;
    let sorter = dynamicSort("start");
    srcFiles.forEach(s => {
        console.log(s);
        let src = fs.readFileSync(s, "utf8");
        let comments = [];
        let opts = {
            comment: true,
            sourceType: "module",
            ecmaVersion: "latest",
            onComment: function (block, text, start, end) {
                if (!block) return;
                comments.push({ block, text: block ? `/*${text}*/` : "//" + text, start, end });
            },
        };
        let parsed = Parser.parse(src, opts);
        comments = comments.map(e => ({
            parsed: parse(e.text)[0],
            ...e,
        }));
        let elements =  [...parsed.body, ...comments].sort(sorter);
        console.log(elements);
        debugger
    });
} catch (error) {
    console.error(error);
}