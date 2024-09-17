import { makeTableSortable, Settings, Section, Option, createElement } from "../index.js";
import { React, ReactDOM } from "../src/lib/react_reactdom.js";
const { useState, useEffect } = React;
let table = document.getElementById("sort");
table.querySelectorAll("td").forEach(td => td.addEventListener("click", function () {
    console.log("clicked", this.innerHTML);
}));
makeTableSortable(table);
let div = document.createElement("div");
let reactRoot = ReactDOM.createRoot(div);

function Component(props) {
    console.log(props);
    const [str, setStr] = useState("Hello World");
    useEffect(() => {
        console.log("component mounted");
        return () => console.log("component unmounted");
    });
    window.setStr = setStr;
    return createElement("div", {
        innerHTML: str,
        style: {
            color: "red"
        }
    }).toReact(React);
    // return React.createElement("div", null, str);
}

// reactRoot.render(React.createElement(React.Fragment, null, [React.createElement(Component), React.createElement(Component)]));
// reactRoot.render(React.createElement(Component));
document.body.appendChild(div);

let opt;
let settings = new Settings({
    name: "Settings"
}, [
    new Section({
        name: "General",
        id: "general"
    }, [
        opt = new Option({
            name: "color",
            id: "on_off",
            type: "toggle",
            value: false
        })
    ])
]);
document.body.appendChild(settings.render());
window.opt = opt;

/**
 * 
 * @param {Option} option
 * @param {Function} callback
 * @param {any[]} args
 * @returns 
 */
function bindOptionToReactElement(option, callback = () => { }, args = []) {
    function Component() {
        const [value, setValue] = useState(option.value);
        useEffect(() => {
            function changeListener(event) {
                setValue(event.val);
            }
            option.on("change", changeListener);
            return () => option.off("change", changeListener);
        });
        return createElement("span").add(callback.apply(option, [option.value, option, ...args])).toReact(React);
    }
    return Component;
}
reactRoot.render(React.createElement(bindOptionToReactElement(opt, function (value, option) {
    if (value) {
        return createElement("span", {
            innerHTML: "on",
            style: {
                color: "green"
            }
        });
    } else {
        return createElement("span", {
            innerHTML: "off",
            style: {
                color: "red"
            }
        });
    }
})));