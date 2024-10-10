import {UIElement} from "./UIElement.mjs";

export class UIText extends UIElement {
    constructor(x, y, text, fontSize = "20px", color = "#FFF") {
        super(x, y, 0, 0);
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
    }

    setText(newText) {
        this.text = newText;
    }

    render(graphicEngine) {
        if (this.visible) {
            graphicEngine.ctx.fillStyle = this.color;
            graphicEngine.ctx.font = `${this.fontSize} Arial`;
            graphicEngine.ctx.textAlign = "left";
            graphicEngine.ctx.fillText(this.text, this.x, this.y);
        }
    }
}