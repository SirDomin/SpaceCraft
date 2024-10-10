import {UIElement} from "./UIElement.mjs";

export class UIButton extends UIElement {
    constructor(x, y, width, height, text, onClick) {
        super(x, y, width, height);
        this.text = text;
        this.onClickCallback = onClick;
    }

    render(graphicEngine) {
        if (this.visible) {
            graphicEngine.ctx.fillStyle = "#555";
            graphicEngine.ctx.fillRect(this.x, this.y, this.width, this.height);

            graphicEngine.ctx.fillStyle = "#FFF";
            graphicEngine.ctx.textAlign = "center";
            graphicEngine.ctx.font = "20px Arial";
            graphicEngine.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2 + 7);
        }
    }

    onClick() {
        if (this.enabled && this.onClickCallback) {
            this.onClickCallback();
        }
    }
}