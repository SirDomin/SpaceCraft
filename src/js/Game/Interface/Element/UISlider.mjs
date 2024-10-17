import {UIElement} from "./UIElement.mjs";
import {EventType} from "../../../Event/EventType.mjs";

export class UISlider extends UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent, minValue = 0, maxValue = 100, initialValue = 50, onChange = null) {
        super(xPercent, yPercent, widthPercent, heightPercent);

        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = initialValue;
        this.onChange = onChange;
        this.handleWidth = 10;
        this.draggingHandle = false;
        this.isDraggable = true;
        this.isHandled = false;

        this.handlePercentX = (this.value - this.minValue) / (this.maxValue - this.minValue);

        eventHandler.addMouseHandler('mouseup', () => {
            this.draggingHandle = false;
        })
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;
        const { x, y, width, height } = scaled;

        ctx.fillStyle = '#888';
        ctx.fillRect(x, y, width, height);

        const handleX = x + this.handlePercentX * (width - this.handleWidth);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(handleX, y, this.handleWidth, height);
    }

    updateHandlePosition(mouseX, mouseY, canvas) {
        const dimensions = this.getDimensions(canvas);
        const x = dimensions.x;
        const width = dimensions.width;

        let newHandlePercentX = (mouseX - x) / (width - this.handleWidth);

        this.handlePercentX = Math.max(0, Math.min(newHandlePercentX, 1));

        this.value = this.minValue + this.handlePercentX * (this.maxValue - this.minValue);

        if (this.onChange) {
            this.onChange(this.value);
        }
    }

    checkHandleClick(mouseX, mouseY, canvas) {
        const { x, y, width, height } = this.getDimensions(canvas);

        const handleX = x + this.handlePercentX * (width - this.handleWidth);
        const handleY = y;

        return mouseX >= handleX && mouseX <= handleX + this.handleWidth &&
            mouseY >= handleY && mouseY <= handleY + height;
    }

    startHandle(mouseX, mouseY, canvas) {
        if (this.checkClick(mouseX, mouseY, canvas)) {
            this.draggingHandle = true;
        }
    }
}