if (!Array.isArray(window.devtoolsFormatters)) {
    window.devtoolsFormatters = [];
}

export function consoleButton(obj, func, args = [], label = "button", width = 50, height = width) {
    return { __button: true, obj, func, args, label, width, height };
}

let buttonFormatter = { // button formatter
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
            try { obj.obj[obj.func](...obj.args); } catch (e) { }
            return ["div", {}];
        }
        return null;
    }
}
if (!window.devtoolsFormatters.includes(buttonFormatter)) {
    window.devtoolsFormatters.push(buttonFormatter);
}