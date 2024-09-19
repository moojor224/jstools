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

export class Settings {
    config = {
        name: "settings"
    };
    /** @type {Section[]} */
    sections = [];
    /**
     * creates a new Settings object
     * @param {typeof this.config} config config options
     * @param {Section[]} sections array of sections to add to the settings
     */
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

    /**
     * renders the settings object
     * @returns {HTMLDivElement} settings element
     */
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

    /**
     * returns the section object with the given id
     * @param {string} id
     * @returns {Section}
     */
    getSection(id) {
        return this.sections.find(e => e.config.id == id);
    }

    /**
     * converts the settings object to a stringified JSON object
     * @returns {string}
     */
    export() {
        return JSON.stringify(Object.fromEntries(this.sections.map(e => ([e.config.id, Object.fromEntries(e.options.map(e => [e.config.id, e.config.value]))]))));
    }

    /**
     * imports saved settings
     * @param {string} data stringified json data
     */
    import(data) {
        let json = JSON.parse(data);
        this.sections.forEach(section => {
            section.options.forEach(option => {
                option.config.value = json[section.config.id][option.config.id];
            });
        });
    }

    #eventListeners = {};
    /**
     * dispatches an event on the Settings object
     * @param {Event} event the event to dispatch
     * @returns {Boolean}
     */
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

    /**
     * listens for an event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
        this.#eventListeners[type].push(callback);
    }

    /**
     * stops the specified callback from listening for the specified event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        if (this.#eventListeners[type]) this.#eventListeners[type].splice(this.#eventListeners[type].indexOf(callback), 1);
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

export class Section {
    /** @type {Settings} */
    settings_obj = null;
    /**
     * @type {{
     *   name: string,
     *   id: string
     * }}
     */
    config = {
        name: "section"
    }
    /** @type {Option[]} */
    options = [];

    /**
     * makes a new Section object
     * @param {typeof this.config} config config options
     * @param {Option[]} options array of Options to add to the section
     */
    constructor(config, options) {
        extend(this.config, config); // apply config to this
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

    /**
     * returns the option object with the given id
     * @param {string} name
     * @returns {Option}
     */
    getOption(name) { // returns the section object with the given id
        return this.options.find(e => e.config.id == name);
    }

    /**
     * renders the section object as HTML
     * @returns {HTMLElement}
     */
    render() {
        // devlog("render section");
        let section = createElement("section").add(
            createElement("h2", { innerHTML: this.config.name }) // section title
        );
        section.add(...this.options.map(o => o.render())); // render all options in this section
        return section;
    }

    #eventListeners = {};
    /**
     * dispatches an event on the Section object
     * @param {Event} event the event to dispatch
     * @returns {Boolean}
     */
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

    /**
     * listens for an event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
        this.#eventListeners[type].push(callback);
    }

    /**
     * stops the specified callback from listening for the specified event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        if (this.#eventListeners[type]) this.#eventListeners[type].splice(this.#eventListeners[type].indexOf(callback), 1);
    }
}

export class Option {
    /** @type {HTMLElement} */
    input = null;

    /** @type {Section} */
    section_obj = null;
    /**
     * @type {{
     *  name: string,
     *  value?: string,
     *  values?: string[],
     *  id: string,
     *  type: "dropdown" | "toggle"
     * }}
     */
    config = {
        name: "option",
        type: "toggle",
        value: false
    }

    /**
     * creates a new Option object
     * @param {typeof this.config} config Option options
     */
    constructor(config) {
        extend(this.config, config); // apply config to this
        if (config.value == undefined && config.values) { // if value is not specified, set value to first value in values
            this.config.value = config.values[0];
        }
    }

    /** @returns {string} */
    get value() {
        return this.config.value;
    }

    /** @param {string} val */
    set value(val) {
        // console.log("set value to", val, "cur:", this.config.value);
        this.config.value = val;
    }

    /**
     * renders the option object as HTML
     * @returns {HTMLLabelElement}
     */
    render() {
        // devlog("render option");
        let label = createElement("label"); // clicking a label will activate the first <input> inside it, so the 'for' attribute isn't required
        let span = createElement("span", {
            innerHTML: this.config.name
        });
        let input = this.createInput();
        label.add(span, input);
        return label;
    }

    /**
     * creates the input method specified by the option config
     * @returns {HTMLElement}
     */
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
        }
        input.addEventListener("change", function (event) { // when setting is changed, dispatch change event on the options object
            let evt = new Event("change", { cancelable: true });
            let prop;
            if (input.checked != undefined) {
                prop = "checked";
            } else {
                prop = "value";
            }
            evt.val = input[prop];
            evt.opt = option;
            evt.prop = prop;
            let cont = option.dispatchEvent(evt);
            if (cont) {
                option.value = evt.val;
            } else {
                // console.log("input canceled");
                input[prop] = option.value;
                event.preventDefault();
            }
        });
        option.config.input = input; // save input element to config object
        return input;
    }

    /**
     * binds the option object to a React element
     * 
     * accepts a callback function that is called with the option's value, the
     * option object, and any additional arguments when the option's value changes
     * @param {Option} option
     * @param {(option: this, ...args: any[]) => HTMLElement} callback
     * @param {any[]} args
     * @returns {React.Component}
     */
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
            let reactNode = createElement("span").add(callback.apply(option, [option].concat(args)));
            HTMLElement.prototype.addEventListener = old;
            return reactNode.toReactElement(listeners);
        }
        return Component;
    }

    /**
     * watches multiple Option objects and updates a react element when any of them change
     * @param {Option[]} options options to watch
     * @param {(options: Option[], ...args: any[]) => HTMLElement} callback 
     * @param {*} args 
     * @returns 
     */
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
            let reactNode = createElement("span").add(callback.apply(options, [options].concat(args)));
            HTMLElement.prototype.addEventListener = old;
            return reactNode.toReactElement(listeners);
        }
        return Component;
    }

    #eventListeners = {};
    /**
     * dispatches an event on the Option object
     * @param {Event} event the event to dispatch
     * @returns {Boolean}
     */
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

    /**
     * listens for an event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        if (!this.#eventListeners[type]) this.#eventListeners[type] = [];
        this.#eventListeners[type].push(callback);
    }

    /**
     * stops the specified callback from listening for the specified event
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        if (this.#eventListeners[type]) this.#eventListeners[type].splice(this.#eventListeners[type].indexOf(callback), 1);
    }
}
