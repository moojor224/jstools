import { makeTableSortable, Settings, Section, Option, createElement, logFormatted } from "../index.js";
import { React, ReactDOM } from "../src/lib/react_reactdom.js";
const { useState, useEffect } = React;
let table = document.getElementById("sort");
table.querySelectorAll("td").forEach(td => td.addEventListener("click", function () {
    console.log("clicked", this.innerHTML);
}));
makeTableSortable(table, {
    func: function (val) {
        let filtered = val.replaceAll(/[$,]/g, "");
        if (filtered.length == 0 || isNaN(Number(filtered))) return val;
        return Number(filtered);
    }
});
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
    }).toReactElement(React);
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
            name: "money",
            id: "on_off",
            type: "toggle",
            value: false
        })
    ])
]);
document.body.appendChild(settings.render());
window.opt = opt;



reactRoot.render(settings.bindToReactElement(function (set, num) {
    let option = set.getSection("general").getOption("on_off").as("toggle");
    if (option.value) {
        return createElement("span", {
            innerHTML: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(num / 100),
            style: {
                color: "green"
            },
            onclick: () => {
                console.log("green");
            },
        });
    } else {
        return createElement("span", {
            innerHTML: num,
            style: {
                color: "red"
            },
            onclick: () => {
                console.log("red");
            },
        });
    }
}, [319999]));

console.log(logFormatted({
    a: function () {
        console.log("hello world");
    },
    b: "test"
}, {
    collapsed: true,
    embedObjects: false,
    raw: true,
}));