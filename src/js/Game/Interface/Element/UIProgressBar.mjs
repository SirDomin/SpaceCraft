import {UIElement} from "./UIElement.mjs";

export class UIProgressBar extends UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent, color = "#FF4C4C") {
        super(xPercent, yPercent, widthPercent, heightPercent);
        this.currentValue = 0;
        this.maxValue = 0;
        this.color = color;

        this.displayValue = true
        this.gain = 0;
        this.backgroundColor = null;

        return this;
    }

    setValue(value) {
        this.currentValue = value;

        return this;
    }

    showValue(value) {
        this.displayValue = value;

        return this;
    }

    setBackgroundColor(value) {
        this.backgroundColor = value;

        return this;
    }

    setColor(color) {
        this.color = color;

        return this;
    }


    update(currentValue, maxValue, gain) {
        this.maxValue = maxValue;
        this.gain = gain;
        this.currentValue = currentValue;
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;
        const { x, y, width, height } = scaled;

        if (this.visible) {

            ctx.fillStyle = this.backgroundColor ?? this.darkenColor(this.color, 0.3);
            ctx.fillRect(x, y, width, height);

            const progressWidth = (this.currentValue / this.maxValue) * width;
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, progressWidth, height);

            graphicEngine.ctx.strokeStyle = 'black';
            graphicEngine.ctx.lineWidth = 1;
            graphicEngine.ctx.strokeRect(x, y, width, height);

        }

        if (this.displayValue === true) {
            graphicEngine.ctx.fillStyle = 'black';
            graphicEngine.ctx.font = '10px Arial';
            graphicEngine.ctx.textAlign = 'center';
            graphicEngine.ctx.fillText(`${this.currentValue} / ${this.maxValue} (${this.gain >= 0 ? "+" : "-"}${this.gain}/s)`, x + width / 2, y + height / 2 + 4);
            graphicEngine.ctx.textAlign = 'left';
        }
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substring(0, 2), 16) * (1 - factor));
        const g = Math.floor(parseInt(hex.substring(2, 4), 16) * (1 - factor));
        const b = Math.floor(parseInt(hex.substring(4, 6), 16) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
}