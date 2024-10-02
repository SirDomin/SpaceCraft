import {InterfaceType} from "../InterfaceType.mjs";
import {InterfaceObject} from "../InterfaceObject.mjs";

export class Button extends InterfaceObject {
    text;

    constructor(x, y, w, h) {
        super(x, y, w , h);

        return this;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    setText(text) {
        this.text = text;
    }
}