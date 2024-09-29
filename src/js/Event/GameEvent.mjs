export class GameEvent {
    _eventName;
    _name;
    _callback;
    _single;
    _priority;
    debug;
    _object;

    constructor(eventName, callback, name, priority) {
        this._name = name;
        this._callback = callback;
        this._priority = priority;
        this._eventName = eventName;
        this._object = null;

        return this;
    }

    forObject(object) {
        this._object = object;

        return this;
    }

    getSingle() {
        return this._single;
    }

    setSingle(value) {
        this._single = value;

        return this;
    }

    getName() {
        return this._name;
    }

    setName(value) {
        this._name = value;

        return this;
    }

    getCallback() {
        return this._callback;
    }

    setCallback(value) {
        this._callback = value;

        return this;
    }

    getPriority() {
        return this._priority;
    }

    setPriority(value) {
        this._priority = value;

        return this;
    }

    getEventName() {
        return this._eventName;
    }

    setEventName(value) {
        this._eventName = value;

        return this;
    }
}