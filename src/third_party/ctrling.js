/**
 * MIT License
 * 
 * Copyright (c) 2021 Demetrius Lorenz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class CtrlElement {
    constructor(input, target) {
        this.options = {};
        this.label = input.options.label;
        this.id = input.id;
        Object.assign(this.options, input.options);
        delete this.options.label;
        delete this.options.type;
        if (input.path) {
            this.path = input.path;
            this.props = this.path.split('/') || undefined;
            this.lastProp = this.props.pop();
        } else {
            this.props = [];
            this.lastProp = 'value';
            target = this;
        }
        this.targetAccess = new Proxy(this.props.reduce((ref, prop) => ref[prop], target), {});
        this.state = this.targetAccess[this.lastProp];
        this._children = [];
        this._self = document.createElement('div');
        this._self.setAttribute('class', 'ctrl-element');
    }
    get self() { return this._self; }
    get children() { return this._children; }
    set children(child) { this._children.push(...child); }
    createDisplay() {
        const display = document.createElement('input'),
            attributes = [{ el: display, name: ['type', 'class', 'id', 'value'], val: ['number', 'ctrl-display', this.id, this.options.defaultValue || false] }];
        this.setAttributes(attributes);
        return display;
    }
    createWrapper(className = 'ctrl-wrapper') {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', className);
        return wrapper;
    }
    createLabel() {
        const label = document.createElement('div');
        label.setAttribute('class', 'ctrl-label');
        label.textContent = `__ ${this.label} _____________________________`;
        return label;
    }
    appendElements(reciever, ...elements) {
        for (let element of elements) {
            reciever.appendChild(element);
        }
    }
    setAttributes(attributes) {
        for (let attribute of attributes) {
            for (let i = 0; i < attribute.name.length; i++) {
                attribute.el.setAttribute(attribute.name[i], attribute.val[i]);
            }
        }
    }
    addListener(evt, fn, target) {
        for (let child of this.children) {
            child.addEventListener(evt, () => {
                const value = (typeof child.value === 'boolean') ? child.value :
                    (isNaN(+child.value)) ? child.value : +child.value;
                this.updateState(value);
                if (fn !== undefined) return fn.bind(target)();
            });
        }
    }
    notify(/* context, key */) {
        for (let child of this.children) {
            child.update(this);
        }
    }
    updateState(value) {
        if (value !== this.state) {
            const min = this.options.min ? this.options.min : value,
                max = this.options.max ? this.options.max : value;
            if (Math.max(min, value) === value && Math.min(max, value) === value || typeof value === 'string' || typeof value === 'boolean') {
                this.state = value;
                this.targetAccess[this.lastProp] = this.state;
                this.notify();
            }
        }
    }
    reviewState() {
        if (this.targetAccess[this.lastProp] !== this.state) {
            this.state = this.targetAccess[this.lastProp];
            this.notify();
        }
    }
    static round(val, acc) {
        if (typeof val === 'number') {
            return Math.round(val * 10 ** acc) / (10 ** acc);
        } else if (typeof val === 'object') {
            let str = JSON.stringify(val);
            let members = str.split(',').map(m => m.split(':'));
            for (let member in members) {
                for (let value in members[member]) {
                    if (!isNaN(+members[member][value])) {
                        const roundedValue = CtrlElement.round(+members[member][value], acc);
                        members[member][value] = roundedValue;
                    }
                }
            }
            str = members.map(m => m.join(':')).join(',');
            const props = str.split('').map(s => {
                const value = (s === '{') ? '{&nbsp;' :
                    (s === '}') ? '<br>}' :
                        (s === ':') ? ':&nbsp;' :
                            (s === '\"') ? '' :
                                (s === ',') ? ',<br>&nbsp;&nbsp;&nbsp;' : s;
                return value;
            });
            str = "".concat(...props);
            return `${str}`
        }
    }
}

class CtrlButton extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const button = document.createElement('button'),
            attributes = [{ el: button, name: ['class', 'id', 'type'], val: ['ctrl-button', this.id, 'button'] }];
        button.innerHTML = this.label;
        button.update = function () { };
        this.setAttributes(attributes);
        this.self.appendChild(button);
        this.children = [button];
    }
}

class CtrlColorInput extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const wrapper = this.createWrapper(), textInput = this.createDisplay(), display = this.createDisplay(), picker = this.createDisplay(), label = this.createLabel(),
            attributes = [{ el: textInput, name: ['type', 'class', 'value'], val: ['text', 'ctrl-color-input', this.options.color] },
            { el: picker, name: ['type', 'class', 'style', 'value'], val: ['color', 'ctrl-color-picker', `opacity:0`, `${this.options.color}`] },
            { el: display, name: ['class', 'style', 'readonly'], val: ['ctrl-color-display', `background-color:${this.options.color};`, true] }];
        textInput.update = function (context) {
            this.value = context.state;
        }
        picker.update = function (context) {
            display.setAttribute('style', `background-color:${context.state}`);
        }

        this.setAttributes(attributes);
        this.appendElements(wrapper, display, picker, textInput)
        this.appendElements(this.self, label, wrapper);
        this.children = [picker, textInput];
    }
}

class CtrlNumberInput extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const wrapper = this.createWrapper(), numInput = this.createDisplay(), label = this.createLabel(),
            attributes = [{ el: numInput, name: ['type', 'class', 'min', 'max', 'step'], val: ['number', 'ctrl-input', this.options.min || Infinity, this.options.max || Infinity, this.options.step || 1] }];
        numInput.update = function (context) {
            this.value = context.state;
        }
        this.setAttributes(attributes);
        this.appendElements(wrapper, numInput);
        this.appendElements(this.self, label, wrapper);
        this.children = [numInput];
    }
}

class CtrlSlider extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const wrapper = this.createWrapper(), slider = document.createElement('input'), display = this.createDisplay(), label = this.createLabel(),
            attributes = [{ el: slider, name: ['class', 'id', 'type', 'min', 'max', 'step', 'value'], val: ['ctrl-slider', this.id, 'range', this.options.min || 0, this.options.max || 100, this.options.step || 1, this.options.defaultValue || this.options.value] },
            { el: display, name: ['min', 'max', 'step'], val: [this.options.min || 0, this.options.max || 100, this.options.step || 1] }];
        slider.update = function (context) {
            this.value = context.state;
        }
        display.update = function (context) {
            this.value = context.state;
        }
        this.setAttributes(attributes);
        this.appendElements(wrapper, display, slider);
        this.appendElements(this.self, label, wrapper);
        this.children = [display, slider];
    }
}

class CtrlToggle extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const wrapper = this.createWrapper(), display = this.createDisplay(), label = this.createLabel(), slider = document.createElement('span'), checkbox = document.createElement('input'), toggle = document.createElement('div'),
            attributes = [{ el: slider, name: ['class'], val: ["toggle-slider"] },
            { el: checkbox, name: ['type'], val: ['checkbox'] },
            { el: display, name: ['type', 'readonly'], val: ['', true] },
            { el: toggle, name: ['class', 'id'], val: ['ctrl-toggle', this.id] }];
        toggle.default = this.options.defaultValue || false;
        toggle.switchTo = this.options.switchTo || true;
        toggle.value = toggle.switchTo;
        toggle.update = function (context) {
            if (context.state === this.default) {
                this.value = this.switchTo;
            } else {
                this.value = this.default;
            }
            display.value = context.state;
            this.checked = context.state;
        }
        display.update = function () {
            //render()
        }
        this.setAttributes(attributes);
        this.appendElements(toggle, checkbox, slider);
        this.appendElements(wrapper, display, toggle);
        this.appendElements(this.self, label, wrapper);
        this.children = [display, toggle];
    }
}

class CtrlDropdown extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const wrapper = this.createWrapper(), dropdown = document.createElement('select'), menuWrapper = this.createWrapper('ctrl-dropdown-wrapper'), display = this.createDisplay(), label = this.createLabel(),
            attributes = [{ el: dropdown, name: ['class', 'id'], val: ['ctrl-dropdown', this.id] },
            { el: display, name: ['type', 'readonly'], val: ["", true] }],
            items = Reflect.ownKeys(this.options);
        for (let item of items) {
            if (item === 'default') { continue; }
            const option = document.createElement('option');
            option.textContent = item;
            option.value = this.options[item];
            if (item === 'defaultValue') {
                option.selected = true;
                option.textContent = this.options['default'] || 'default';
                display.value = this.options[item];
            }
            dropdown.appendChild(option);
        }

        dropdown.update = function (context) {
            for (let child of this.children) {
                if (context.state === +child.value) {
                    child.selected = true;
                }
            }
        }
        display.update = function (context) {
            this.value = context.state;
        }
        this.setAttributes(attributes);
        this.appendElements(menuWrapper, dropdown);
        this.appendElements(wrapper, display, menuWrapper)
        this.appendElements(this.self, label, wrapper);
        this.children = [display, dropdown];
    }
}

class CtrlOutput extends CtrlElement {
    constructor(input, target) {
        super(input, target);
        const output = document.createElement('table'), tr = document.createElement('tr'), label = document.createElement('td'), data = document.createElement('td'),
            attributes = [{ el: output, name: ['class'], val: ['ctrl-output'] },
            { el: label, name: ['class'], val: ['ctrl-output-label'] },
            { el: data, name: ['class'], val: ['ctrl-output-data'] }];
        const accuracy = this.options.accuracy || 0;
        label.textContent = `${this.label} ${this.options.unit ? '[' + this.options.unit + ']' : ''}`;
        data.innerHTML = CtrlElement.round(this.options.defaultValue, accuracy);
        data.update = function (context) {
            data.innerHTML = CtrlElement.round(context.state, accuracy);
        }
        this.setAttributes(attributes);
        this.appendElements(tr, label, data);
        this.appendElements(output, tr);
        this.appendElements(this.self, output);
        this.children = [data];
    }
}

class Ctrl extends HTMLElement {
    static get observedAttributes() {
        return ['dirty'];
    }
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
        this._inputs = [];
        this._outputs = [];
        this._objectives = [];
        this._elements = [];
    }

    get root() { return this._root; }
    get targetObj() { return window[this.getAttribute('ref')]; }
    set targetObj(q) { if (q) this.setAttribute('ref', q); }
    get inputs() { return this._inputs; }
    set inputs(o) { return this._inputs.push(o); }
    get outputs() { return this._outputs; }
    set outputs(o) { return this._outputs.push(o); }
    get elements() { return this._elements; }
    set elements(o) { return this._elements.push(o); }
    get dirty() { return this.getAttribute('dirty'); }
    set dirty(bool) { return this.setAttribute('dirty', bool); }

    //optional attributes
    get header() { return this.getAttribute('header') || 'ctrl-ing'; }
    set header(q) { if (q) this.setAttribute('header', q); }
    get id() { return this.getAttribute('id') || "ctrl"; }
    set id(q) { if (q) this.setAttribute('id', q); }
    get xOffset() { return this.getAttribute('xOffset') || 0; }
    get yOffset() { return this.getAttribute('yOffset') || 0; }
    get parent() { return this.getAttribute('parent') || undefined; }

    connectedCallback() {
        if (this.getAttribute('id') == undefined) this.id = this.id;
        this.parseJSON();
        this.init();
        this.offset = this.root.querySelector('.ctrl').getBoundingClientRect();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.dirty === "true") {
            for (let element of this.elements) {
                element.reviewState();
            }
            this.dirty = false;
        }
    }

    init() {
        const gui = this.createGui(), style = document.createElement('style'), events = ['click', 'change', 'input'];
        style.textContent = Ctrl.template(this.setPosition());
        // create & append CtrlElements dependend on userinput
        for (let input of this.inputs) {
            const element = (input.options.type === 'number') ? new CtrlNumberInput(input, this.targetObj) :
                (input.options.type === 'slider') ? new CtrlSlider(input, this.targetObj) :
                    (input.options.type === 'dropdown') ? new CtrlDropdown(input, this.targetObj) :
                        (input.options.type === 'toggle') ? new CtrlToggle(input, this.targetObj) :
                            (input.options.type === 'button') ? new CtrlButton(input, this.targetObj) :
                                (input.options.type === 'color') ? new CtrlColorInput(input, this.targetObj) :
                                    (input.options.type === 'output') ? new CtrlOutput(input, this.targetObj) : console.log('wrong type');
            this.elements = element;
            let event = (input.hasOwnProperty('event')) ? Object.values(input).find(key => events.includes(key)) : 'input';
            let callback = (event != undefined) ? this.targetObj[input.func] || window[input.func] : undefined;
            element.addListener(event, callback, this.targetObj);
            gui.querySelector('.ctrl-cb').appendChild(element.self);
        }
        this._root.appendChild(gui);
        this._root.appendChild(style);
    }

    createGui() {
        const gui = document.createElement('div');
        gui.setAttribute('class', 'ctrl');
        const folder = document.createElement('div');
        folder.setAttribute('class', 'ctrl-container');
        const header = document.createElement('div');
        header.innerHTML = this.header;
        header.setAttribute('class', 'ctrl-header');
        const contenBox = document.createElement('div');
        contenBox.setAttribute('class', 'ctrl-cb');

        gui.appendChild(folder);
        folder.appendChild(header);
        folder.appendChild(contenBox);
        return gui;
    }

    setPosition() {
        const ctrl = this.root.host;
        const parent = (this.parent) ? document.getElementById(this.parent) : undefined;
        let top = +this.yOffset, right = +this.xOffset;
        if (parent !== undefined) top += parent.getBoundingClientRect().top - ctrl.getBoundingClientRect().top;
        else {
            const parent = ctrl.parentElement;
            const nodes = parent.childElementCount;
            if (nodes === 1) top += (parent.getBoundingClientRect().width !== 0) ? parent.getBoundingClientRect().top - ctrl.getBoundingClientRect().top : 0;
            else {
                for (let i = nodes - 1; i >= 0; i--) {
                    const child = parent.children[i];
                    if (child !== ctrl) continue;
                    else {
                        let previous = child.previousElementSibling;
                        for (let j = 0; j != i; j++) {
                            const width = previous.getBoundingClientRect().width;
                            if (width !== 0) {
                                top += previous.getBoundingClientRect().top - ctrl.getBoundingClientRect().top;
                                break;
                            } else previous = previous.previousElementSibling;
                        }
                    }
                    break;
                }
            }
        }
        return { x: right, y: top }
    }

    getValue(path) {
        if (path !== undefined) {
            const paths = path.split('/'),
                last = paths.pop();
            return paths.reduce((ref, prop) => ref[prop], this.targetObj)[last];
        }
    }

    setValue(path, newValue) {
        if (path !== undefined) {
            const paths = path.split('/'),
                last = paths.pop();
            if (newValue !== true && newValue !== false) { newValue = +newValue; }
            paths.reduce((ref, prop) => ref[prop], this.targetObj)[last] = newValue;
        }
    }

    getID(path) {
        if (path !== undefined) {
            const keys = path.split('/');
            return keys.join('-');
        }
    }

    parseJSON() {
        try {
            const types = ['number', 'slider', 'dropdown', 'toggle', 'button', 'color', 'output'];
            const innerHTML = JSON.parse(this.innerHTML);

            for (let elem of innerHTML.add) {
                const type = Object.keys(elem).find(key => types.includes(key));
                const props = (elem.hasOwnProperty('path')) ? elem.path.split('/') : elem.path = undefined,
                    prop = (props !== undefined) ? props.pop() : undefined,
                    defaultValue = (props !== undefined) ? this.getValue(elem.path) : undefined,
                    event = (elem.hasOwnProperty('on')) ? Reflect.ownKeys(elem.on).shift() : elem.on = undefined;
                Object.defineProperty(elem, 'options', { value: { type: type, label: prop || type, defaultValue: defaultValue }, writable: true, enumerable: true, configurable: true });
                if (elem.on !== undefined) {
                    Object.defineProperty(elem, 'event', { value: event, writable: true, enumerable: true, configurable: true });
                    Object.defineProperty(elem, 'func', { value: elem.on[event], writable: true, enumerable: true, configurable: true });
                }
                // check if there are additional options (eg. min,max,step,label, etc.)
                if (Object.entries(elem[type]) != 0) Object.assign(elem.options, elem[type]);
                // check if there is a custom id
                if (!elem.hasOwnProperty('id') && elem.hasOwnProperty('path')) elem.id = this.getID(elem.path);
                // save the default value (value at initiation)
                //if(elem.hasOwnProperty('path')) elem.options.default = this.getValue(elem.path);
                if (type === 'button') elem.id = `${elem.options.label.toLowerCase()}-button`;
                if (type === 'color') elem.id = `${elem.options.label.toLowerCase()}-color`;
                delete elem.on;
                delete elem[type];
                this.inputs = elem;

            };

            return true;
        }
        catch (e) { console.log(e)/* this._root.innerHTML = e.message; */ }
        return false;
    }

    update() {
        this.dirty = true;
    }

    static template(position) {
        document.documentElement.style.setProperty('--ctrl-base-background-color', '#fffff8');
        document.documentElement.style.setProperty('--ctrl-base-shadow-color', '#10162f');

        return `


            /* .ctrl:hover {
                -webkit-transform: translate(-0.25rem, -0.25rem);
                -moz-transform: translate(-0.25rem, -0.25rem);
                -ms-transform: translate(-0.25rem, -0.25rem);
                transform: translate(-0.25rem, -0.25rem);
            } */

            *, ::after, ::before {
                box-sizing: inherit;
                margin:0;
                font-size: 12px;
                font-family: Lucida Grande, Tahoma, Arial;
            }

            .ctrl {
                display: block;
                margin-bottom: 0.5em;
                color: #1a1a1a;
                position: relative;
                top: ${position.y}px;
                right: ${position.x}px;
                float: right;
                background-color: var(--ctrl-base-background-color);
                box-sizing: border-box;
                border: 1px solid black;
                /*border-radius: 0px 25px 0px 25px;*/
                /*box-shadow: 10px 5px 1.5px black;*/
                /*overflow: hidden;*/
                -webkit-transition: 200ms -webkit-transform;
                transition: 200ms transform;
            }

           /*  *, ::after, ::before {
                box-sizing: inherit;
            }

            .ctrl::before {
                z-index: -1;
            }

            .ctrl::after,.ctrl::before {
                content: '';
                position: absolute;
                background-color: inherit;
                border-width: inherit;
                border-color: inherit;
                border-radius: inherit;
                border-style: inherit;
                top: -1px;
                left: -1px;
                width: calc(100% + 2px);
                height: calc(100% + 2px);
            }

            .ctrl:hover::after {
                -webkit-transform: translate(0.5rem,0.5rem);
                -moz-transform: translate(0.5rem,0.5rem);
                -ms-transform: translate(0.5rem,0.5rem);
                transform: translate(0.5rem,0.5rem);
            }

            .ctrl::after {
                z-index: -2;
                background-color: var(--ctrl-base-shadow-color);
                -webkit-transition: inherit;
                transition: inherit;
            } */

            .ctrl-button {
                grid-column: 1 / 6;
                background: #3839ab linear-gradient(hsla(0, 0, 100%, .2), transparent);
                background-color: #C8D6C7;
                border: 1px solid rgba(0, 0, 0, .5);
                border-radius: 3px;
                /* box-shadow: 0 .2em .4em rgba(0, 0, 0, .5);  */
                color: black;
                /* text-shadow: 0 -.05em .05em rgba(0, 0, 0, .5); */
                /* margin-left: 0.25em; */
                transition: all 0.25s ease;
            }

            .ctrl-button:hover:active {
                /* letter-spacing: 2px; */
                letter-spacing: 2px ;
                background-color: #C8D6C7;
                /* box-shadow: 0 .2em .4em rgba(0, 0, 0, 0);  */
            }

            .ctrl-button:hover {
                background-color: #98ab97;
                /* box-shadow: 0 .2em .4em rgba(0, 0, 0, 0);  */
            }

            .ctrl-container {
                width: 12.5rem;
            }

            .ctrl-header {
                color: #E2DDDB;
                background-color: #58595B;
                padding-left: 0.25em;
            }

            .ctrl-cb {
                border-top: 1px solid black;
                padding-top: 0.5em;
                /* word-wrap: anywhere; */
            }
            .ctrl-wrapper{
                display: grid;
                grid-column: 1/6;
                grid-row: 2;
                grid-template-columns: repeat(5, 20%);
                border: 1px solid black;
                border-radius: 0 0 3px 3px;
                border-top: none;
            }

            .ctrl-element {
                display: grid;
                grid-template-columns: repeat(5, 20%);
                grid-template-rows: repeat(2,max-content);
                margin: 0 0.25rem;
                margin-bottom: 0.25rem;
            }
            .ctrl-label {
                grid-column: 1/6;
                grid-row: 1;
                white-space: nowrap;
                overflow: hidden;
                margin-bottom: -0.1rem;
                z-index: 1;

            }
            .ctrl-display {
                grid-column: 1 / 3;
                margin-right: 0.25rem;
            }
            .ctrl-color-display {
                grid-column: 1 / 3;
                margin-right: 0.25rem;
            }
            .ctrl-dropdown-wrapper,.ctrl-slider {
                grid-column: 3 / 6;
            }
            .ctrl-input {
                grid-column: 1 / 6;
            }
            .ctrl-color-input {
                grid-column: 3 / 6;
            }
            .ctrl-output {
                grid-column: 1 / 6;
                grid-row: 1 / 2;
                display: flex;
                font-size: 0.75rem;
                word-wrap: anywhere;
                overflow: scroll;
                scrollbar-width: none;
                white-space: pre-wrap;
                background-color: #C8D6C7;
                border: 1px solid rgba(0, 0, 0, .51);
                border-radius: 3px;
                max-height: 3rem;
            }
            .ctrl-output-label {
                width: 50%;
                padding-right: 0.5rem;
                padding-left: 0.25em;
                border-right: 2px solid rgba(0, 0, 0, .5);
                vertical-align: top;

            } 
            .ctrl-output-data{
                width: 10rem; 
                padding-left: 0.5rem;
            }
            .ctrl-symbol, .ctrl-button {
                height: 1.25rem;
            }
            .ctrl-color-picker{
                position: absolute;
                left:0;
                width: 40%;
            }
            .ctrl-input, .ctrl-display, .ctrl-color-input, .ctrl-color-display {
                height: 1.25rem;
                padding: 0.25em 0;
                background-color: #C8D6C7;
                text-align: center;
                border: 0px;
                border-radius: 0 0 2px 2px;
            }

            .ctrl-symbol {
                font-size: 0.75em;
                width: 100%;
                background-color: #C8D6C7;
                text-align: center;
                border: 1px solid #C8D6C7;
                border-radius: 3px;
            }

            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            input[type="number"] {
                -moz-appearance: textfield;
            }

        /* begin dropdown styling */
            .ctrl-dropdown {
                -webkit-appearance: none;
                appearance: none;
                width:100%;
                height: 1.25rem;
                margin:auto;
                background-color: #C8D6C7;
                border: 1px solid #C8D6C7;
                border-radius: 3px;
            }
            .ctrl-dropdown-wrapper {
                position: relative;
            }
            .ctrl-dropdown-wrapper::after {
                content: "▾";
                font-weight:bold;
                font-size: 1.25rem;
                top: -3.5px;
                right: 5px;
                position: absolute;
            }
        /* end dropdown styling */

        /* begin toggle styling */
            .ctrl-toggle {
                grid-column: 3/6;
            }
            .ctrl-toggle input {
                position:absolute;
                width:2.5rem;
                height:1.25rem;
                margin-left: 20%;
                z-index:2;
                cursor:pointer;
                opacity:0;
            }
            .ctrl-toggle .toggle-slider { /* Grundfläche */
                position: absolute;
                width: 20%;
                height: 1.25rem;
                margin-left: 20%;
                cursor: pointer;
                background-color: #c32e04; 
                border-radius: 1em; 
                transition: all .3s ease-in-out;
            }
            .ctrl-toggle  .toggle-slider::before {  /* verschiebbarer Button */
                position: absolute;
                content: "";
                height: 1rem;
                width: 1rem;
                left: .2em;
                top: .2em;
                background-color: white;
                border-radius: 50%;
                transition: all .3s ease-in-out;
            }
            .ctrl-toggle input:checked + .toggle-slider {
                background-color: #5a9900;
                /* green */
            }
        
            .ctrl-toggle input:checked + .toggle-slider:before {
                -webkit-transform: translateX(1.25rem);
                /* Android 4 */
                -ms-transform: translateX(1.25rem);
                /* IE9 */
                transform: translateX(1.25rem);
            }
            /* end toggle styling */
      `;
    }
}

customElements.define('ctrl-ing', Ctrl);


/* function displayTime() {
    let date = new Date();
    let time = date.toLocaleTimeString();
    document.getElementById('demo').textContent = time;
 }

 const createClock = setInterval(displayTime, 1000); */