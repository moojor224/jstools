import * as fs from "fs";
import * as path from "path";
import vsctm from "vscode-textmate";
import oniguruma from "vscode-oniguruma";
import { exit } from "process";

const __dirname = path.dirname(new URL(import.meta.url).pathname).substring(1);
const grammarFile = path.resolve('./typescript.tmlanguage');
// const grammarFile = path.resolve('./javascript.plist');
console.log(grammarFile);
// exit(0);

/**
 * Utility to read a file as a promise
 */
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => error ? reject(error) : resolve(data));
    });
}

const wasmBin = fs.readFileSync(path.join(__dirname, './node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
        createOnigScanner(patterns) { return new oniguruma.OnigScanner(patterns); },
        createOnigString(s) { return new oniguruma.OnigString(s); }
    };
});

// Create a registry that can create a grammar from a scope name.
const registry = new vsctm.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: (scopeName) => {
        if (scopeName === 'source.js') {
            return readFile(grammarFile).then(data => {
                // console.log(data.toString());
                return vsctm.parseRawGrammar(data.toString());
            })
        }
        console.log(`Unknown scope name: ${scopeName}`);
        return null;
    }
});
class a {
    #b = null;
    constructor() {
        this.a = 1;
        this.#b = 2;
        `multiline
        test`;
    }
    r(a = 1, b) {
        console.log(this.#b, a, b, {
            a: 2,
            b: {
                c: 3
            }
        });
    }
    a() {
        this.r("", 1, true);
        if (true) {
            console.log("true");
        }
    }
}
// Load the JavaScript grammar and any other grammars included by it async.
registry.loadGrammar('source.js').then(grammar => {
    let html = [];
    const text = [
        `const regex = ${/s[range]{1}(?=:)\d+/g};`,
        `let string = "contents";`,
        "var template = `template string`;",
        ...a.toString().replaceAll("\r", "").split("\n"),
    ];
    let ruleStack = vsctm.INITIAL;
    for (let i = 0; i < text.length; i++) {
        let linehtml = ""
        const line = text[i];
        const lineTokens = grammar.tokenizeLine(line, ruleStack);
        console.log(`\nTokenizing line: ${line}`);
        for (let j = 0; j < lineTokens.tokens.length; j++) {
            const token = lineTokens.tokens[j];
            linehtml += `<span class="${token.scopes.join(' ')}">${line.substring(token.startIndex, token.endIndex)}</span>`;
        }
        // linehtml += "\n";
        html.push(linehtml);
        ruleStack = lineTokens.ruleStack;
    }
    const otag = '<div class="line">';
    const ctag = '</div>';
    html = `${otag}${html.join(`${ctag}${otag}`)}${ctag}`;
    html = `<html><head><link rel="stylesheet" href="./style.css"></head><body style="
    animation: flash 1.5s ease-in-out;
    animation-iteration-count: infinite;
    color: red;
    white-space: pre;
    font-family: Consolas, 'Courier New', monospace;
    font-weight: normal;
    font-size: 14px;
    font-feature-settings: 'liga' 0, 'calt' 0;
    font-variation-settings: normal;
    line-height: 19px;
    letter-spacing: 0;
    background-color: #1f1f1f;
    ">${html}</body></html>`;
    fs.writeFileSync("./syntax-highlight.html", html);
}).catch(error => {
    console.error(error);
    debugger;
});