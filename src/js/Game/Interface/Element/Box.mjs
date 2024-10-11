import {UIElement} from "./UIElement.mjs";

export class Box extends UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent) {
        super(xPercent, yPercent, widthPercent, heightPercent);
        this.color = 'black';
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;
        const { x, y, width, height } = scaled;

        if (this.visible) {
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, width, height);
        }
    }

    onClick() {
        if (this.enabled && this.onClickCallback) {
            this.onClickCallback();
        }
    }
}