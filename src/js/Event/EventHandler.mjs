import {EventType} from "./EventType.mjs";
import {GameEvent} from "./GameEvent.mjs";

export class EventHandler {
    keysDown;
    keyHandlers;

    constructor(){
        this.keysDown = [];
        this.keyHandlers = [];
        this.mouseHandlers = {
            mousedown: [],
            mouseup: [],
            mousemove: [],
        };

        this.eventHandlers = {

        };

        this.mouse = {
            x: null,
            y: null,
            click: false
        }

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);

    }

    tick(deltaTime) {
        this.handleKeysDown(deltaTime);
        this.handleEvents();
    }

    handleKeysDown = (deltaTime) => {
        for (let keyCode in this.keyHandlers) {
            if (this.keysDown[keyCode]) {
                const handler = this.keyHandlers[keyCode];

                if (handler.single && handler.handled) {
                    continue;
                }

                handler.handled = true;

                if (debug && handler.debug !== false) {
                    console.log(`Event %c${handler.name || "for keycode " + keyCode}%c has been dispatched with deltaTime: ${deltaTime}`, 'color: cyan; font-weight: bold;', 'color: inherit;');
                }

                handler.callback(deltaTime);
            }
        }
    };

    handleMouseEvents = () => {
        for (let x in this.mouseHandlers) {
            if(this.mouseHandlers[x].single) {
                if (this.mouseHandlers[x].handled === true) {
                    continue;
                }
                this.mouseHandlers[x].handled = true;
            }
            if (debug) {
                console.log(`Event %c${this.mouseHandlers[x].name || x}%c has been dispatched with: `, 'color: cyan; font-weight: bold;', 'color: inherit;', this.mouse);
            }
            this.mouseHandlers[x].callback(this.mouse);
        }
    }

    addKeyHandler(keyCode, callback, single = false) {
        this.keyHandlers[keyCode] = {
            callback: callback,
            single: single,
        };
        if (debug) {
            console.log(`Event for key %c${keyCode}%c has been created`, 'color: green; font-weight: bold;', 'color: inherit;');
        }

        return this.keyHandlers[keyCode];
    }

    addEventHandler(eventType, callback, name = null, single = false, priority = 0) {
        if (!this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = [];
        }

        const index = this.eventHandlers[eventType].push(new GameEvent(eventType, callback, name, priority).setSingle(single));

        if (debug) {
            console.log(`Event %c${name}%c has been created`, 'color: green; font-weight: bold;', 'color: inherit;');
        }

        return this.eventHandlers[eventType][index - 1];
    }


    dispatchEvent(eventType, eventData) {
        if (this.eventHandlers[eventType]) {
            this.eventHandlers[eventType].sort((a, b) => {
                return b.getPriority() - a.getPriority()
            }).forEach(handler => {
                handler.getCallback()(eventData);
                if (debug && handler.debug !== false) {
                    console.log(`Event %c${handler.name || eventType}%c has been dispatched with: `, 'color: cyan; font-weight: bold;', 'color: inherit;', eventData);
                }
            });
        }
    }

    handleEvents() {

    }

    addMouseHandler(type, callback, name = null, single = false) {
        if (!this.mouseHandlers[type]) {
            throw 'available events for mouse: mousedown, mouseup, mousemove';
        }

        const mouseEvent = new GameEvent(null, callback, name, 0).setSingle(single);

        const index = this.mouseHandlers[type].push(mouseEvent);

        if (debug) {
            console.log(`Event %c${name}%c has been created`, 'color: green; font-weight: bold;', 'color: inherit;');
        }

        return this.mouseHandlers[type][index - 1];
    }

    onKeyDown = (e) => {
        this.keysDown[e.keyCode] = true;
    }

    onKeyUp = (e) => {
        delete this.keysDown[e.keyCode];

        if (this.keyHandlers[e.keyCode]){
            this.keyHandlers[e.keyCode].handled = false;
        }
    }

    onMouseDown = (e) => {
        let x = e.pageX;
        let y = e.pageY;

        this.setMouseX(x);
        this.setMouseY(y);
        this.setMouseClick(true);

        this.mouseHandlers.mousedown = this.mouseHandlers.mousedown.sort((a, b) =>{
            return a.getPriority() - b.getPriority()
        });

        for (let i = 0; i < this.mouseHandlers.mousedown.length; i++) {
            const handler = this.mouseHandlers.mousedown[i];

            const result = handler.getCallback()(this.mouse);

            if (debug && handler.debug !== false) {
                console.log(`Event %c${handler.getName()}%c has been dispatched with: `, 'color: cyan; font-weight: bold;', 'color: inherit;', this.mouse);
            }

            if (handler.getSingle() === true && result === true) {
                break;
            }
        }
    }

    onMouseUp = (e) => {
        let x = e.pageX;
        let y = e.pageY;

        this.setMouseX(x);
        this.setMouseY(y);
        this.setMouseClick(false);

        for (let i = 0; i < this.mouseHandlers.mouseup.length; i++) {
            const handler = this.mouseHandlers.mouseup[i];

            handler.getCallback()(this.mouse);

            if (debug && handler.debug !== false) {
                console.log(`Event %c${handler.getName() || 'mouseup'}%c has been dispatched with: `, 'color: cyan; font-weight: bold;', 'color: inherit;', this.mouse);
            }

            if (handler.getSingle() === true) {
                break;
            }
        }
    }

    onMouseMove = (e) => {
        let x = e.pageX;
        let y = e.pageY;

        this.setMouseX(x);
        this.setMouseY(y);

        for (let i = 0; i < this.mouseHandlers.mousemove.length; i++) {
            const handler = this.mouseHandlers.mousemove[i];
            handler.getCallback()(this.mouse);

            if (debug && handler.debug !== false) {
                console.log(`Event %c${handler.getName() || 'mousemove'}%c has been dispatched with: `, 'color: cyan; font-weight: bold;', 'color: inherit;', this.mouse);
            }

            if (handler.getSingle() === true) {
                break;
            }
        }

    }

    setMouseX = (x) => {
        this.mouse.x = x / window.gameScale;
    }

    setMouseY = (y) => {
        this.mouse.y = y / window.gameScale;
    }

    setMouseClick = (click) => {
        this.mouse.click = click;
    }

    removeKeyHandler(keyCode) {
        delete this.keyHandlers[keyCode];
    }

    removeHandler(name) {
        for (const eventType in this.eventHandlers) {
            if (this.eventHandlers.hasOwnProperty(eventType)) {
                const prevLength = this.eventHandlers[eventType].length;

                this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(handler => handler.getName() !== name);
                if (debug) {
                    if (this.eventHandlers[eventType].length !== prevLength) {
                        console.log(`Event %c${name}%c has been removed`, 'color: red; font-weight: bold;', 'color: inherit;');
                    }
                }
            }
        }
    }

    removeMouseHandler(name) {
        for (const eventType in this.mouseHandlers) {
            if (this.mouseHandlers.hasOwnProperty(eventType)) {
                const prevLength = this.mouseHandlers[eventType].length;

                this.mouseHandlers[eventType] = this.mouseHandlers[eventType].filter(handler => handler.getName() !== name);
                if (debug) {
                    if (this.mouseHandlers[eventType].length !== prevLength) {
                        console.log(`Event %c${name}%c has been removed`, 'color: red; font-weight: bold;', 'color: inherit;');
                    }
                }
            }
        }
    }
}