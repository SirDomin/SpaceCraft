import {UIElement} from "./UIElement.mjs";

export class UIText extends UIElement {
    constructor(xPercent, yPercent, text, fontSize = "20px", color = "#FFF") {
        super(xPercent, yPercent, 0, 0);
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.resizeHandleSize = 1;
        this.recalculated = false;

        return this;
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;

        if (!this.recalculated) {
            const textMetrics = ctx.measureText(this.text);
            const textWidth = textMetrics.width;

            this.widthPercent = textWidth / graphicEngine.canvas.width;

            this.heightPercent = parseInt(this.fontSize, 10) / graphicEngine.canvas.height;
        }

        const { x, y } = scaled;

        if (this.visible) {
            ctx.fillStyle = this.color;
            ctx.font = `${this.fontSize} Arial`;
            ctx.textAlign = "left";
            ctx.fillText(this.text, x, y + parseInt(this.fontSize, 10));
        }
    }

    setText(newText) {
        this.text = newText;
        this.recalculated = false;

        return this;
    }
}