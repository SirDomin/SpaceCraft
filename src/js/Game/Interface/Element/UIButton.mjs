import {UIElement} from "./UIElement.mjs";

export class UIButton extends UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent, text, onClick) {
        super(xPercent, yPercent, widthPercent, heightPercent);
        this.text = text;
        this.onClickCallback = onClick;
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;
        const { x, y, width, height } = scaled;

        if (this.visible) {
            ctx.fillStyle = this.hovering ? "#777" : "#555";
            ctx.fillRect(x, y, width, height);

            ctx.fillStyle = "#FFF";
            ctx.textAlign = "center";
            ctx.font = "20px Arial";
            ctx.fillText(this.text, x + width / 2, y + height / 2 + 7);

            if (this.hovering) {
                ctx.strokeStyle = "#FFF";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
            }
        }
    }

    onClick() {
        if (this.enabled && this.onClickCallback) {
            this.onClickCallback();
        }
    }
}