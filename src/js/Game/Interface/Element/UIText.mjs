import {UIElement} from "./UIElement.mjs";

export class UIText extends UIElement {
    constructor(xPercent, yPercent, text, fontSize = "20px", color = "#FFF") {
        super(xPercent, yPercent, 0, 0);
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.resizeHandleSize = 1;
        this.recalculated = false;
        this.textAlign = 'left'

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

        const { x, y, width } = scaled;

        if (this.visible) {
            ctx.fillStyle = this.color;
            ctx.font = `${this.fontSize} Arial`;

            ctx.textAlign = this.textAlign;

            let renderX = x;

            switch (this.textAlign) {
                case 'center':
                    renderX = x + width / 2;
                    break;
                case 'right':
                    renderX = x + width;
                    break;
                case 'left':
                default:
                    renderX = x;
                    break;
            }

            ctx.fillText(this.text, renderX, y + parseInt(this.fontSize, 10));
        }
    }

    setTextAlign(align) {
        this.textAlign = align;

        return this;
    }

    setText(newText) {
        this.text = newText;
        this.recalculated = false;

        return this;
    }
}