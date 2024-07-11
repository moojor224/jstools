import _node_overrides from "./_node_overrides.js";
_node_overrides();

if (!Array.isArray(window.devtoolsFormatters)) {
    window.devtoolsFormatters = [];
}

export function consoleButton(obj, func, args = [], label = "button", width = 50, height = width) {
    return { __button: true, obj, func, args, label, width, height };
}

let buttonFormatter = { // button formatter
    label: "button",
    header: function (obj) {
        if (obj.__button) {
            return ["div", { // the button itself
                style: `width:${obj.width}px;height:${obj.height}px;border:1px solid red;background-color:white;text-align:center;cursor:pointer;color:black;padding:5px;`
            }, ["span", {}, obj.label]];
        }
        return null;
    },
    hasBody: function (obj) {
        if (obj.__button) return true;
        return null;
    },
    body: function (obj) {
        if (obj.__button) { // call function when button is "clicked" (expanded)
            try { obj.func(...obj.args); } catch (e) { }
            return ["div", {}];
        }
        return null;
    }
}
if (!window.devtoolsFormatters.includes(buttonFormatter)) {
    window.devtoolsFormatters.push(buttonFormatter);
}
let collapsed_formatter = {
    label: "collapsed formatter",
    hasBody: function (obj) {
        if (typeof obj.__collapsed != "boolean") {
            return false;
        }
        return !!obj.__collapsed;
    },
    header: function (obj) {
        if (typeof obj.__collapsed != "boolean") {
            return null;
        }
        return ["div", { style: `color:${obj.__color || "inherit"}` }, obj.__label];
    },
    body: function (obj) {
        if (obj.__collapsed) {
            if (typeof obj.__data == "string") return ["div", {}, obj.__data];
            return ["div", ["object", { object: obj.__data }]];
        }
        return ["div", "No data"];
    }
};
if (!window.devtoolsFormatters.includes(collapsed_formatter)) {
    window.devtoolsFormatters.push(collapsed_formatter);
}
(function () { // custom formatters
    if (!Array.isArray(globalThis.devtoolsFormatters)) {
        globalThis.devtoolsFormatters = [];
    }
    try {
        typeof $.jstree.core.prototype == "undefined";
    } catch (err) {
        return
    }
    if (globalThis.devtoolsFormatters.find(e => e.label == "jstree")) {
        return;
    }
    function isJstree(obj) {
        try {
            if (Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(obj)))))) == $.jstree.core.prototype) {
                return true;
            }
        } catch (err) { }
        return false;
    }
    class node {
        constructor(data) {
            let children = data.children;
            if (children) {
                children = children.map(e => new node(e));
            }
            this.children = children;
            this.text = data.text;
        }
        render() {
            if (this.children && this.children.length > 0) {
                let top = ["div"];
                this.children.forEach(e => top.push(["div", {
                    style: "padding-left:20px;"
                }, ["object", { object: e }]]));
                return top;
            }
            return ["div"];
        }
    }
    window.devtoolsFormatters.push({ // jstree formatter
        label: "jstree",
        header: function (obj) {
            if (isJstree(obj)) {
                return ["div", "jstree"];
            }
            return null;
        },
        hasBody: function (obj) {
            return isJstree(obj);
        },
        body: function (obj) {
            if (isJstree(obj)) {
                let top = ["div"];
                function get_nodes(tree) {
                    function recurse(n) {
                        let node = tree.get_node(n);
                        if (!Array.isArray(node.children)) {
                            return node;
                        }
                        node.children = node.children.map(e => recurse(e));
                        return node;
                    }
                    return recurse("#");
                }
                let nodes = get_nodes(obj);
                let n = new node(nodes);
                top.push(n.render());
                return top;
            }
            return null;
        }
    });
    window.devtoolsFormatters.push({ // node formatter
        label: "node",
        header: function (obj) {
            if (obj instanceof node) {
                return ['div', obj.text];
            }
            return null;
        },
        hasBody: function (obj) {
            if (!obj.children) return false;
            return obj instanceof node && obj.children.length > 0;
        },
        body: function (obj) {
            if (obj instanceof node) {
                let top = ["div"];
                return obj.render();
            }
            return null;
        }
    });
})();