import { createElement } from "./createElement.js";
import { extend } from "./utility.js";

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

export class Settings extends EventTarget {
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
        super(); // initialize EventTarget object
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
     * converts the settings object to a stringified JSON object cabable of being imported through the Settings.fromJson() method
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

    /**
     * dispatches an event on the Settings object
     * @param {Event} event the event to dispatch
     * @returns {Boolean}
     */
    dispatchEvent(event) {
        // console.log("dispatching settings event:", event.type, event);
        let originalDispatch = EventTarget.prototype.dispatchEvent.bind(this); // get copy of original dispatchEvent function
        let cont = originalDispatch.apply(this, [event]); // call original dispatchEvent function
        // console.log("settings event default prevented:", event.defaultPrevented, event.cancelable, cont);
        return !event.defaultPrevented && cont;
    }

    /**
     * listens for an event\
     * wrapper function for addEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        // console.log("binding settings listener", type, callback);
        let originalAddEventListener = EventTarget.prototype.addEventListener.bind(this); // get copy of original addEventListener function
        originalAddEventListener.apply(this, [type, callback]); // call original addEventListener function
    }

    /**
     * stops the specified callback from listening for the specified event\
     * wrapper function for removeEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        // this.removeEventListener(type, callback);
        let originalRemoveEventListener = EventTarget.prototype.removeEventListener.bind(this); // get copy of original removeEventListener function
        originalRemoveEventListener.apply(this, [type, callback]); // call original removeEventListener function
    }

    /**
     * converts stringified json data into a settings object\
     * json data can be generated from the export method
     * @static
     * @param {string} jsontext stringified json data
     * @returns {Settings}
     */
    static fromJson(jsontext) {
        if (jsontext.length == 0) {
            return null;
        }
        try {
            let json = JSON.parse(jsontext);
            try {
                json.sections.forEach(s => s.options.forEach(o => delete o.config.input))
            } catch (err) { }
            let validate = Joi.object({ // validate object to make sure it's in the correct format
                config: Joi.object({
                    name: Joi.string().required()
                }).required(),
                sections: Joi.array().items(Joi.object({
                    config: Joi.object({
                        name: Joi.string().required(),
                        id: Joi.string().required()
                    }),
                    options: Joi.array().items(Joi.object({
                        config: Joi.object({
                            name: Joi.string().required(),
                            id: Joi.string().required(),
                            type: Joi.string().required(),
                            value: Joi.any(),
                            values: Joi.array()
                        }).required()
                    })).required()
                })).required()
            }).validate(json);
            if (validate.error) { // object isn't in the correct format
                console.error("invalid json data");
                throw new Error(validate.error);
            }
            return new Settings(json.config, json.sections.map(sec => { // parse object into settings, sections, and options
                return new Section(sec.config, sec.options.map(opt => {
                    return new Option(opt.config);
                }));
            }));
        } catch (err) {
            console.error(err);
            return err;
        }
    }

    /**
     * replaces this settings object with another one by overriding sections array and config\
     * meant to be used with the Settings.fromJson() method
     * @param {Settings} settings settings object to replace this one with
     */
    replaceWith(settings) {
        console.log("replacing", Object.assign({}, this), "with", Object.assign({}, settings));
        // replaces this settings object with another one by overriding sections array and config.
        // because this object was exported, it can't be assigned in other modules,
        // so a custom function had to be made
        if (!(settings instanceof Settings)) { // only override if provided object is a Setting object
            console.log("settings object is not an instance of the Settings class", settings);
            return;
        }
        this.config = settings.config; // override config
        this.sections = settings.sections; // override sections
        this.sections.forEach(section => {
            section.settings_obj = this; // set parent object for each section
            section.options.forEach(option => {
                option.section_obj = section; // set parent object for each option
            });
        });
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

export class Section extends EventTarget {
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
        super(); // initialize EventTarget
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

    /**
     * dispatches an event on the Section object
     * @param {string} type event type
     * @param {Object} config event options/data
     */
    dispatchEvent(event) {
        // console.log("dispatching section event", event);
        let originalDispatch = EventTarget.prototype.dispatchEvent.bind(this); // get copy of original dispatchEvent function
        let cont = originalDispatch.apply(this, [event]); // call original dispatchEvent function
        if (cont) this.settings_obj.dispatchEvent(event); // bubble event to parent element
        // console.log("section event default prevented:", event.defaultPrevented, event.cancelable, cont);
        return !event.defaultPrevented && cont;
    }

    /**
     * listens for an event\
     * wrapper for addEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        // console.log("on", this.#listeners);
        let originalAddEventListener = EventTarget.prototype.addEventListener.bind(this); // get copy of original addEventListener function
        originalAddEventListener.apply(this, [type, callback]); // call original addEventListener function
    }

    /**
     * stops the specified callback from listening for the specified event\
     * wrapper for removeEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        // console.log("off", this.#listeners);
        let originalRemoveEventListener = EventTarget.prototype.removeEventListener.bind(this); // get copy of original removeEventListener function
        originalRemoveEventListener.apply(this, [type, callback]); // call original removeEventListener function
    }
}

export class Option extends EventTarget {
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
     *  type: "dropdown" | "slider"
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
        super(); // initialize EventTarget object
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
     * dispatches an event on the Option object
     * @param {Event} event event
     * @returns {Boolean}
     */
    dispatchEvent(event) {
        // console.log("dispatching option event", event.val);
        let originalDispatch = EventTarget.prototype.dispatchEvent.bind(this); // save copy of original dispatchEvent function
        let cont = originalDispatch.apply(this, [event]); // call original dispatchEvent function
        if (cont) this.section_obj.dispatchEvent(event); // bubble event to parent section
        return !event.defaultPrevented && cont;
    }

    /**
     * listens for an event\
     * wrapper function for addEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    on(type, callback) {
        // console.log("option on", this.#listeners);
        let originalAddEventListener = EventTarget.prototype.addEventListener.bind(this); // get copy of original addEventListener function
        originalAddEventListener.apply(this, [type, callback]); // call original addEventListener function
    }

    /**
     * stops the specified callback from listening for the specified event\
     * wrapper function for removeEventListener
     * @param {string} type type of event
     * @param {Function} callback callback function
     */
    off(type, callback) {
        // console.log("option off", this.#listeners);
        let originalRemoveEventListener = EventTarget.prototype.removeEventListener.bind(this); // get copy of original removeEventListener function
        originalRemoveEventListener.apply(this, [type, callback]); // call original removeEventListener function
    }
}
