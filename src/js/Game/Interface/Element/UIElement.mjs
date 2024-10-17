import {EventType} from "../../../Event/EventType.mjs";

export class UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent) {
        this.xPercent = xPercent;
        this.yPercent = yPercent;
        this.widthPercent = widthPercent;
        this.heightPercent = heightPercent;
        this.visible = true;
        this.enabled = true;
        this.hovering = false;

        this.gridSize = 0;

        this.responsive = true;
        this.isResizing = false;
        this.resizeHandleSize = 10;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.isDraggable = false;
        this.isHandled = false;

        this.initialWidth = null;
        this.initialHeight = null;

        this.currentResizeHandle = null;

        this.index = 0;
    }

    setIndex(index) {
        this.index = index;

        return this;
    }

    init() {
        eventHandler.dispatchEvent(EventType.UI_ELEMENT_CREATE, this);

        return this;
    }

    initializeNonResponsive(canvas) {
        if (!this.responsive && this.initialWidth === null) {
            this.initialWidth = this.widthPercent * canvas.width;
            this.initialHeight = this.heightPercent * canvas.height;
        }
    }

    getDimensions(canvas) {
        if (this.responsive) {
            return {
                x: this.xPercent * canvas.width,
                y: this.yPercent * canvas.height,
                width: this.widthPercent * canvas.width,
                height: this.heightPercent * canvas.height,
            };
        } else {
            return {
                x: this.xPercent * canvas.width,
                y: this.yPercent * canvas.height,
                width: this.initialWidth,
                height: this.initialHeight,
            };

        }

    }

    renderResizeHandles(graphicEngine, canvas) {
        if (!edit || this.responsive === false) return;

        const ctx = graphicEngine.ctx;

        const dimensions = this.getDimensions(canvas);

        const x = dimensions.x;
        const y = dimensions.y;
        const width = dimensions.width;
        const height = dimensions.height;

        const halfHandleSize = this.resizeHandleSize / 2;

        ctx.fillStyle = "#FFF";

        ctx.fillRect(x - halfHandleSize, y - halfHandleSize, this.resizeHandleSize, this.resizeHandleSize);
        ctx.fillRect(x + width - halfHandleSize, y - halfHandleSize, this.resizeHandleSize, this.resizeHandleSize);
        ctx.fillRect(x - halfHandleSize, y + height - halfHandleSize, this.resizeHandleSize, this.resizeHandleSize);
        ctx.fillRect(x + width - halfHandleSize, y + height - halfHandleSize, this.resizeHandleSize, this.resizeHandleSize);
    }

    checkClick(mouseX, mouseY, canvas) {
        const dimensions = this.getDimensions(canvas);
        const x = dimensions.x;
        const y = dimensions.y;
        const width = dimensions.width;
        const height = dimensions.height;

        return this.enabled &&
            mouseX >= x &&
            mouseX <= x + width &&
            mouseY >= y &&
            mouseY <= y + height;
    }

    checkHover(mouseX, mouseY, canvas) {
        const dimensions = this.getDimensions(canvas);

        const x = dimensions.x;
        const y = dimensions.y;
        const width = dimensions.width;
        const height = dimensions.height;

        this.hovering = mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    startDragging(mouseX, mouseY, canvas) {
        const dimensions = this.getDimensions(canvas);

        const x = dimensions.x;
        const y = dimensions.y;

        this.isDragging = true;
        this.dragOffsetX = Math.round((mouseX - x) * 100) / 100;
        this.dragOffsetY = Math.round((mouseY - y) * 100) / 100;
    }

    stopDragging() {
        this.isDragging = false;
        this.promptConfig();
    }

    updatePosition(mouseX, mouseY, canvas) {
        if (this.isDragging) {
            const gridPixelWidth = canvas.width * this.gridSize;
            const gridPixelHeight = canvas.height * this.gridSize;

            const newX = mouseX - this.dragOffsetX;
            const newY = mouseY - this.dragOffsetY;

            const snappedX = Math.round(newX / gridPixelWidth) * gridPixelWidth;
            const snappedY = Math.round(newY / gridPixelHeight) * gridPixelHeight;

            this.xPercent = Math.round(snappedX / canvas.width * 100) / 100;
            this.yPercent = Math.round(snappedY / canvas.height * 100) / 100;
        }
    }

    checkResizeHandleClick(mouseX, mouseY, canvas) {
        if (!edit || this.responsive === false) return null;
        const x = this.xPercent * canvas.width;
        const y = this.yPercent * canvas.height;
        const width = this.widthPercent * canvas.width;
        const height = this.heightPercent * canvas.height;
        const halfHandleSize = this.resizeHandleSize / 2;

        if (mouseX >= x - halfHandleSize && mouseX <= x + halfHandleSize && mouseY >= y - halfHandleSize && mouseY <= y + halfHandleSize) {
            return 'top-left';
        }
        if (mouseX >= x + width - halfHandleSize && mouseX <= x + width + halfHandleSize && mouseY >= y - halfHandleSize && mouseY <= y + halfHandleSize) {
            return 'top-right';
        }
        if (mouseX >= x - halfHandleSize && mouseX <= x + halfHandleSize && mouseY >= y + height - halfHandleSize && mouseY <= y + height + halfHandleSize) {
            return 'bottom-left';
        }
        if (mouseX >= x + width - halfHandleSize && mouseX <= x + width + halfHandleSize && mouseY >= y + height - halfHandleSize && mouseY <= y + height + halfHandleSize) {
            return 'bottom-right';
        }
        return null;
    }

    startResizing(mouseX, mouseY, handle, canvas) {
        this.isResizing = true;
        this.currentResizeHandle = handle;
        const x = this.xPercent * canvas.width;
        const y = this.yPercent * canvas.height;

        this.isDragging = true;
        this.dragOffsetX = Math.round((mouseX - x) * 100) / 100;
        this.dragOffsetY = Math.round((mouseY - y) * 100) / 100;
    }

    stopResizing() {
        this.isResizing = false;
        this.currentResizeHandle = null;
        this.promptConfig();
    }

    setPercentX(x) {

        this.xPercent = x;
    }

    setPercentY(y) {

        this.yPercent = y;
    }

    setPercentWidth(width) {
        this.widthPercent = width;
    }

    setPercentHeight(height) {
        this.heightPercent = height;
    }

    updateSize(mouseX, mouseY, canvas) {
        this.isDragging = false;
        if (!this.isResizing || !this.currentResizeHandle) return;
        const newWidth = (mouseX - this.xPercent * canvas.width);
        const newHeight = (mouseY - this.yPercent * canvas.height);
        const gridPixelWidth = canvas.width * this.gridSize;
        const gridPixelHeight = canvas.height * this.gridSize;

        let snappedWidth = Math.round(newWidth / gridPixelWidth) * gridPixelWidth;
        let snappedHeight = Math.round(newHeight / gridPixelHeight) * gridPixelHeight;

        const newX = mouseX - this.dragOffsetX;
        const newY = mouseY - this.dragOffsetY;

        const snappedX = Math.round(newX / gridPixelWidth) * gridPixelWidth;
        const snappedY = Math.round(newY / gridPixelHeight) * gridPixelHeight;

        const newXCalculated = Math.round(snappedX / canvas.width * 100) / 100;
        const newYCalculated = Math.round(snappedY / canvas.height * 100) / 100;

        const xDelta = this.xPercent - newXCalculated;
        const yDelta = this.yPercent - newYCalculated;

        switch (this.currentResizeHandle) {
            case 'top-left':
                this.yPercent = newYCalculated;
                this.heightPercent += yDelta;
                this.xPercent = newXCalculated;
                this.widthPercent += xDelta
                break;
            case 'top-right':
                this.widthPercent = snappedWidth / canvas.width;
                this.yPercent = newYCalculated;
                this.heightPercent += yDelta;
                break;
            case 'bottom-left':
                this.xPercent = newXCalculated;
                this.widthPercent += xDelta
                this.heightPercent = snappedHeight / canvas.height;
                break;
            case 'bottom-right':
                this.widthPercent = snappedWidth / canvas.width;
                this.heightPercent = snappedHeight / canvas.height;
                break;
        }
    }

    promptConfig() {
        console.log(`${this.xPercent}, ${this.yPercent}, ${this.widthPercent}, ${this.heightPercent}`);

    }

    onClick() {

    }
}