/** @typedef {import("./types.d.ts")} jstools */
import { createElement } from "./createElement.js";
import { React } from "./lib/react_reactdom.js";
import { extend } from "./utility.js";
const { useState, useEffect } = React;

if (!Array.isArray(window.devtoolsFormatters)) {
    window.devtoolsFormatters = [];
}

let settingsFormatter = {
    label: "settings formatter",
    header: function (obj) {
        if (obj instanceof Settings) { // return header if object is a Settings object
            return ['div', { style: 'font-weight:bold;' }, `Settings: `, ["span", { style: "font-style:italic;" }, obj.config.name]];
        }
        return null;
    },
    hasBody: function (obj) {
        return obj instanceof Settings;
    },
    body: function (obj) {
        if (obj instanceof Settings) {
            return ["div", {}, ...obj.sections.map(section => {
                return [
                    "div",
                    ["object", {
                        object: section // embed section object
                    }]
                ]
            })];
        }
        return null;
    }
};
if (!window.devtoolsFormatters.includes(settingsFormatter)) { // only add one instance of the formatter
    window.devtoolsFormatters.push(settingsFormatter);
}

/** @type {typeof import("./types.d.ts").Settings} */
export let Settings = class {
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['config']} */
    config = {};
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['sections']} */
    sections = [];
    /** @type {(...args: ConstructorParameters<typeof import("./types.d.ts").Settings>) => Settings} */
    constructor(config = {}, sections) {
        extend(this.config, config); // apply config to this
        if (!Array.isArray(sections)) { // turn sections into array if it isn't already
            sections = [sections];
        }
        this.sections = sections.filter(e => e instanceof Section); // filter all non-Section elements out of sections array
        sections.forEach(section => {
            if (section instanceof Section) {
                section.settings_obj = this; // set parent object of each section
            }
        });
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['render']} */
    render() {
        // devlog("render settings");
        let div = createElement("div", { // main settings div
            classList: "settings"
        }).add(
            createElement("h2", { innerHTML: this.config.name })
        );
        div.add(...this.sections.map(s => s.render())); // render all subsections and add them to the settings div
        return div;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['getSection']} */
    getSection(id) {
        return this.sections.find(e => e.config.id == id);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['export']} */
    export() {
        return JSON.stringify(Object.fromEntries(this.sections.map(e => ([e.config.id, Object.fromEntries(e.options.map(e => [e.config.id, e.config.value]))]))));
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['import']} */
    import(data) {
        let json = JSON.parse(data);
        this.sections.forEach(section => {
            section.options.forEach(option => {
                if (section.config.id in json) {
                    if (option.config.id in json[section.config.id]) {
                        option.value = json[section.config.id][option.config.id];
                    }
                }
            });
        });
    }

    #eventListeners = {};
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['dispatchEvent']} */
    dispatchEvent(event) {
        let cont = true;
        if (this.#eventListeners[event.type]) {
            for (let i = 0; i < this.#eventListeners[event.type].length; i++) {
                let c = this.#eventListeners[event.type][i](event);
                if (event.defaultPrevented || (!c && c != undefined)) {
                    cont = false;
                    break;
                }
            }
        }
        return !event.defaultPrevented && cont;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['on']} */
    on(type, callback) {
        if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
        this.#eventListeners[type].push(callback);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['off']} */
    off(type, callback) {
        if (this.#eventListeners[type]) this.#eventListeners[type].splice(this.#eventListeners[type].indexOf(callback), 1);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Settings>['bindToReactElement']} */
    bindToReactElement(callback = () => { }, args = []) {
        let settings = this;
        function Component() {
            const [value, setValue] = useState(0);
            useEffect(() => { // listen for changes to option's value
                function changeListener() {
                    setValue(value + 1); // ensure value is different to enforce re-render
                }
                settings.on("change", changeListener); // listen for changes
                return () => settings.off("change", changeListener); // stop listening when component reloads
            });
            let listeners = [];
            let old = HTMLElement.prototype.addEventListener;
            HTMLElement.prototype.addEventListener = function (...args) {
                listeners.push([this, args]);
                old.apply(this, args);
            }
            let result = callback.apply(settings, [settings].concat(args));
            if (!result instanceof HTMLElement) {
                result = createElement("span").add(result);
            }
            let reactNode = result;
            HTMLElement.prototype.addEventListener = old;
            return reactNode.toReactElement(listeners);
        }
        return React.createElement(Component);
    }
}

let sectionFormatter = {
    label: "section formatter",
    header: function (obj) {
        if (obj instanceof Section) { // return header if object is a Section object
            return ["div", { // main wrapper div
                style: "border:1px solid #000;border-radius:9px;padding-top:10px;background-color:#454d55;width:300px;color:white"
            }, ["div", { style: "padding:0 10px;display: block;font-size:1.5em;font-weight:bold;margin-block-start:.83em;margin-block-end:.83em" }, obj.config.name], // "h2"
                ...obj.options.map(option => { // each option
                    return [
                        "div", // "label"
                        { style: "border-top:1px solid #000;width:100%;display:flex;justify-content:space-between;padding:10px;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;" },
                        ["span", {}, option.config.name],
                        ["div", {}, ["span", { style: "float:right" }, (function () {
                            if (Array.isArray(option.config.values)) {
                                return ["object", {
                                    object: { // dropdown list of values
                                        __expandable: true,
                                        title: option.config.value,
                                        contents: [
                                            ...option.config.values.map(e => ["div", {}, e])
                                        ]
                                    }
                                }];
                            }
                            return option.config.value + "";
                        })()]]
                    ];
                })
            ];
        } else if (obj.__expandable) {
            return ["div", {}, obj.title || "custom object"];
        }
        return null;
    },
    hasBody: function (obj) {
        if (obj.__expandable) {
            return true;
        }
        return false;
    },
    body: function (obj) {
        if (obj.__expandable) {
            return ["div", {}, ...obj.contents]
        }
    }
};
if (!window.devtoolsFormatters.includes(sectionFormatter)) { // only add one instance of the formatter
    window.devtoolsFormatters.push(sectionFormatter);
}

/** @type {typeof import("./types.d.ts").Section} */
export let Section = class {
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['settings_obj']} */
    settings_obj = null;
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['config']} */
    config = {};
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['options']} */
    options = [];

    /** @type {(...args: ConstructorParameters<typeof import("./types.d.ts").Section>) => Section} */
    constructor(config, options) {
        this.config = extend({
            name: "section",
            id: "section"
        }, config); // apply config to this
        if (!Array.isArray(options)) { // turn options into array if it isn't one already
            options = [options];
        }
        this.options = options.filter(e => e instanceof Option); // remove all non-Option items from array
        options.forEach(option => {
            if (option instanceof Option) {
                option.section_obj = this; // set parent object for each option
            }
        });
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['getOption']} */
    getOption(id) { // returns the section object with the given id
        return this.options.find(e => e.config.id == id);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['render']} */
    render() {
        // devlog("render section");
        let section = createElement("section").add(
            createElement("h2", { innerHTML: this.config.name }) // section title
        );
        section.add(...this.options.map(o => o.render())); // render all options in this section
        return section;
    }

    #eventListeners = {};
    /** @type {InstanceType<typeof import("./types.d.ts").Section>['dispatchEvent']} */
    dispatchEvent(event) {
        let cont = true;
        if (this.#eventListeners[event.type]) {
            for (let i = 0; i < this.#eventListeners[event.type].length; i++) {
                let c = this.#eventListeners[event.type][i](event);
                if (event.defaultPrevented || (!c && c != undefined)) {
                    cont = false;
                    break;
                }
            }
        }
        return (!event.defaultPrevented && cont) ? this.settings_obj.dispatchEvent(event) : false;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['on']} */
    on(type, callback) {
        if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
        this.#eventListeners[type].push(callback);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Section>['off']} */
    off(type, callback) {
        if (this.#eventListeners[type]) this.#eventListeners[type].splice(this.#eventListeners[type].indexOf(callback), 1);
    }
}

/** @type {typeof import("./types.d.ts").Option} */
export let Option = class {
    /** @type {InstanceType<typeof import("./types.d.ts").Option>['section_obj']} */
    section_obj = null;
    /** @type {InstanceType<typeof import("./types.d.ts").Option>['config']} */
    config = {
        name: "option",
        type: "toggle",
        value: false
    }

    /** @type {(...args: ConstructorParameters<typeof import("./types.d.ts").Option>) => Option} */
    constructor(config) {
        extend(this.config, config); // apply config to this
        if (config.value == undefined && config.values) { // if value is not specified, set value to first value in values
            this.config.value = config.values[0];
        }
    }

    get value() {
        return this.config.value;
    }

    set value(val) {
        // console.log("set value to", val, "cur:", this.config.value);
        this.config.value = val;
        if (this.config.input) {
            if (this.config.type == "toggle") {
                this.config.input.checked = val;
            } else if (this.config.type == "dropdown") {
                this.config.input.value = val;
            } else if (this.config.type == "list") {
                let options = Object.keys(val);
                options.forEach(e => {
                    let i = this.config.input.querySelector(`input[name="${e}"]`);
                    if (i) {
                        i.checked = val[e];
                    }
                });
            }
        }
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['as']} */
    as() {
        return this;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['values']} */
    values() {
        return this;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['render']} */
    render() {
        let label = createElement("label"); // clicking a label will activate the first <input> inside it, so the 'for' attribute isn't required
        let span = createElement("span", {
            innerHTML: this.config.name
        });
        let input = this.createInput();
        label.add(span, input);
        return label;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['createInput']} */
    createInput() {
        let input; // initialize variable
        let option = this; // save reference to this
        if (this.config.type == "toggle") { // standard on/off toggle
            input = createElement("input", {
                type: "checkbox",
                classList: "slider", // pure css toggle switch
                checked: option.config.value
            });
        } else if (this.config.type == "dropdown") {
            input = createElement("select");
            let values = [];
            if (this.config.values || (!["undefined", "null"].includes(typeof this.config.values))) { // if list of values is defined
                if (!Array.isArray(this.config.values)) { // if values is not an array, make it one
                    this.config.values = [this.config.values];
                }
                values.push(...this.config.values); // add defined values to list
            }
            values = Array.from(new Set(values)); // remove duplicates
            // input.add(...args);
            values.forEach(v => input.add(createElement("option", {
                innerHTML: v
            })));
            // if specified value is not in the list of predefined values, add it as a placeholder
            if (this.config.value && !this.config.values.includes(this.config.value)) {
                input.insertAdjacentElement("afterBegin", createElement("option", { // insert option element at beginning of select list
                    innerHTML: this.config.value,
                    value: this.config.value,
                    hidden: true, // visually hide placeholder from dropdown
                    disabled: true // prevent user from selecting it
                }));
            }
            input.value = this.config.value || this.config.values[0];
        } else if (this.config.type == "list") {
            input = createElement("div", {
                style: {
                    display: "inline-flex",
                    flexDirection: "column",
                }
            });
            let options = Object.keys(option.config.value);
            options.forEach(e => {
                let label = createElement("label", {
                    innerHTML: e
                });
                let cb = createElement("input", {
                    type: "checkbox",
                    checked: option.config.value[e],
                    name: e
                });
                label.add(cb);
                input.add(label);
            });
        }
        input.classList.add("option-" + this.config.type); // add class to input element
        input.addEventListener("change", function (event) { // when setting is changed, dispatch change event on the options object
            let evt = new Event("change", { cancelable: true });
            let val, reset;
            if (option.config.type == "toggle") {
                val = input.checked;
                reset = () => input.checked = option.config.value;
            } else if (option.config.type == "dropdown") {
                val = input.value;
                reset = () => input.value = option.config.value;
            } else if (option.config.type == "list") {
                let options = Object.keys(option.config.value);
                options.forEach(e => {
                    let i = input.querySelector(`input[name="${e}"]`);
                    if (i) {
                        option.config.value[e] = i.checked;
                    }
                });
                val = option.config.value;
                reset = () => {
                    options.forEach(e => {
                        let i = input.querySelector(`input[name="${e}"]`);
                        if (i) {
                            i.checked = option.config.value[e];
                        }
                    });
                }
            }
            evt.val = val;
            evt.opt = option;
            let cont = option.dispatchEvent(evt);
            if (cont) {
                option.value = evt.val;
            } else {
                reset();
                event.preventDefault();
            }
        });
        option.config.input = input; // save input element to config object
        return input;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['bindToReactElement']} */
    bindToReactElement(callback = () => { }, args = []) {
        let option = this;
        function Component() {
            const [value, setValue] = useState(0);
            useEffect(() => { // listen for changes to option's value
                function changeListener() {
                    setValue(value + 1); // ensure value is different to enforce re-render
                }
                option.on("change", changeListener); // listen for changes
                return () => option.off("change", changeListener); // stop listening when component reloads
            });
            let listeners = [];
            let old = HTMLElement.prototype.addEventListener;
            HTMLElement.prototype.addEventListener = function (...args) {
                listeners.push([this, args]);
                old.apply(this, args);
            }
            let result = callback.apply(option, [option].concat(args));
            if (!result instanceof HTMLElement) {
                result = createElement("span").add(result);
            }
            let reactNode = result;
            HTMLElement.prototype.addEventListener = old;
            return reactNode.toReactElement(listeners);
        }
        return React.createElement(Component);
    }

    /** @type {typeof import("./types.d.ts").Option["bindOptionsToReactElement"]} */
    static bindOptionsToReactElement(options, callback = () => { }, args = []) {
        function Component() {
            const [value, setValue] = useState(0);
            useEffect(() => { // listen for changes to option's value
                function changeListener() {
                    setValue(value + 1); // ensure value is different to enforce re-render
                }
                options.forEach(option => option.on("change", changeListener)); // listen for changes
                return () => options.forEach(option => option.off("change", changeListener)); // stop listening when component reloads
            });
            let listeners = [];
            let old = HTMLElement.prototype.addEventListener;
            HTMLElement.prototype.addEventListener = function (...args) {
                listeners.push([this, args]);
                old.apply(this, args);
            }
            let result = callback.apply(options, [options].concat(args));
            if (!result instanceof HTMLElement) {
                result = createElement("span").add(result);
            }
            let reactNode = result;
            HTMLElement.prototype.addEventListener = old;
            return reactNode.toReactElement(listeners);
        }
        return React.createElement(Component);
    }

    #eventListeners = {};
    /** @type {InstanceType<typeof import("./types.d.ts").Option>['dispatchEvent(event)']} */
    dispatchEvent(event) {
        let cont = true;
        if (this.#eventListeners[event.type]) {
            for (let i = 0; i < this.#eventListeners[event.type].length; i++) {
                let c = this.#eventListeners[event.type][i](event);
                if (event.defaultPrevented || (!c && c != undefined)) {
                    cont = false;
                    break;
                }
            }
        }
        return (!event.defaultPrevented && cont) ? this.section_obj.dispatchEvent(event) : false;
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['on']} */
    on(event, listener) {
        if (!this.#eventListeners[event]) this.#eventListeners[event] = [];
        this.#eventListeners[event].push(listener);
    }

    /** @type {InstanceType<typeof import("./types.d.ts").Option>['off']} */
    off(event, listener) {
        if (this.#eventListeners[event]) this.#eventListeners[event].splice(this.#eventListeners[event].indexOf(listener), 1);
    }
}
