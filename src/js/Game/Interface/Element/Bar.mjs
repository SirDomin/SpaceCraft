export class Bar {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.color = color;

        this.displayValue = true

        this.currentValue = 0;
        this.maxValue = 0;
        this.gain = 0;
        this.backgroundColor = null;

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

    render(graphicEngine) {
        const percentage = this.currentValue / this.maxValue;

        graphicEngine.ctx.fillStyle = this.backgroundColor ?? this.darkenColor(this.color, 0.3);

        graphicEngine.ctx.fillRect(this.x, this.y, this.width, this.height);

        graphicEngine.ctx.fillStyle = this.color;
        graphicEngine.ctx.fillRect(this.x, this.y, this.width * percentage, this.height);

        graphicEngine.ctx.strokeStyle = 'black';
        graphicEngine.ctx.lineWidth = 1;
        graphicEngine.ctx.strokeRect(this.x, this.y, this.width, this.height);

        if (this.displayValue === true) {
            graphicEngine.ctx.fillStyle = 'black';
            graphicEngine.ctx.font = '10px Arial';
            graphicEngine.ctx.textAlign = 'center';
            graphicEngine.ctx.fillText(`${this.currentValue} / ${this.maxValue} (${this.gain >= 0 ? "+" : "-"}${this.gain}/s)`, this.x + this.width / 2, this.y + this.height / 2 + 3.5);
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