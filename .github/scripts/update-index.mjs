// console.log("\x1b[31mTHIS IS A TEST MESSAGE TO MAKE SURE THIS FILE RUNS");
console.clear();
import * as fs from "fs";
import * as path from "path";
import * as jstools from "../../index.js"
import { Parser } from "acorn";
import { parse } from "comment-parser";
import Prism from "prismjs";

let { dynamicSort, logFormatted, stringify } = jstools;

let indexPath = path.resolve("./index.html");
let indexHTML = "";

let prism_css = "";
logFormatted.PRISM_CLASSES.forEach(([classes, color]) => {
    const classList = classes.map(e => "." + e).join(",");
    prism_css += `${classList}{color:${color}}\n`;
});

indexHTML += /*html*/`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>jstools</title><link rel="stylesheet" href="./style.css">
<style>${prism_css}</style>
</head>
<body>
    <header>
        <h1>jstools</h1>
    </header>
    <main>
`;

let srcFiles = fs.readdirSync(path.resolve("./src")).map(e => path.parse(path.resolve("./src/", e)));
let fileBlacklist = ["_node_overrides.js", "beautify.js", "emmet.js", "prism.js", "types.d.ts", "validStyles.js"];
fileBlacklist.forEach(bl => {
    srcFiles = srcFiles.filter(e => e.base != bl);
});
srcFiles = srcFiles.map(e => path.resolve(e.dir, e.base));

/**
 * @param {string} source
 */
function generateDoc(source, comments, name) {
    indexHTML += "<div>";
    comments = [comments.pop()];
    comments.forEach(com => {
        if (!com) return;
        let parsed = com.parsed;
        if (!parsed) return;
        let { description, tags } = parsed;
        let params = tags.filter(e => e.tag == "param");
        let type = tags.filter(e => e.tag == "type");
        let returns = tags.filter(e => e.tag == "returns");
        returns = returns.map(e => ({
            description: [e.name, e.description].filter(e => e).join(" "),
            type: e.type + (e.optional ? " | undefined" : ""),
            tag: e.tag,
        }));
        // make table of tags
        let table = "<table><tr><th>Tag</th><th>Name</th><th>Type</th><th>Description</th></tr>";
        let rows = [...params, ...type, ...returns];
        let tableHasContents = false;
        let ent = jstools.toHTMLEntities
        rows.forEach(row => {
            table += `<tr><td>${ent(row.tag)}</td><td>${ent(row.name || "")}</td><td>${ent(row.type)}</td><td>${ent(row.description)}</td></tr>`;
            tableHasContents = true;
        });
        table += "</table>";
        indexHTML += `<h3>${ent(name)}</h3>`;
        indexHTML += `<p>${ent(description)}</p>`;
        if (tableHasContents) {
            indexHTML += table;
        }
    });
    // debugger
    // indexHTML += `<pre>${JSON.stringify(comments.map(e => e.parsed), null, "  ")}</pre><br>`;
    indexHTML += `<pre>${source}</pre><br>`;
    indexHTML += "</div>";
}


try {
    let sorter = dynamicSort("start");
    // let s = srcFiles[0]
    srcFiles.forEach(s => {
        // console.log(s);
        let src = fs.readFileSync(s, "utf8");
        let comments = [];
        let opts = {
            comment: true,
            sourceType: "module",
            ecmaVersion: "latest",
            onComment: function (block, text, start, end) {
                // if (!block) return;
                comments.push({ block, text: block ? `/*${text}*/` : "//" + text, start, end });
            },

        };
        let parsed = Parser.parse(src, opts).body.filter(e => e.type.startsWith("Export"));
        let otherComments = [];
        comments = comments.map(e => ({
            parsed: parse(e.text)[0],
            ...e,
        })).filter(comment => {
            for (let p of parsed) {
                if (comment.start >= p.start && comment.end <= p.end) {
                    otherComments.push(comment);
                    return false;
                }
            }
            return true;
        });
        let elements = [...parsed, ...comments].sort(sorter);
        let exports = [];
        let curClass = [];
        for (let e of elements) {
            if (e.type?.startsWith("Export")) {
                let name = "";
                try {
                    name = ((e.declaration.id || e.declaration.declarations[0].id).name);
                } catch (error) {
                    console.log(e);
                }
                let raw = stringify(jstools[name]);
                if (typeof jstools[name] == "object") raw = `let ${name} = ${raw}`;
                curClass.push(Prism.highlight(raw/* .replaceAll(/\r?\n\s*THISISACOMMENT(?=\/\/)/g, " ") */, Prism.languages.javascript, "javascript"));
                curClass.push(name);
                exports.push(curClass);
                curClass = [];
            } else {
                curClass.push(e);
            }
        }
        // console.log(otherComments);
        indexHTML += `<details><summary><h2>${path.parse(s).base}</h2></summary>`;
        exports.forEach(ex => {
            let name = ex.pop();
            generateDoc(ex.pop(), ex, name);
        });
        indexHTML += `</details>`;
    });
} catch (error) {
    console.error(error);
}

indexHTML += /*html*/`
    </main>
    <footer>

    </footer>
</body></html>
`;
fs.writeFileSync(indexPath, indexHTML, "utf8");
console.log("done");