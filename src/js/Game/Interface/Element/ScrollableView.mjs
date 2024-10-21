import {UIElement} from "./UIElement.mjs";

export class ScrollableView extends UIElement {
    constructor(x, y, width, height) {
        super(x, y, width, height) ;

        this.contentHeight = 0;   // Total height of the content
        this.scrollY = 0;         // Current scroll position
        this.scrollSpeed = 5;     // Scrolling speed

        this.children = [];       // Child UI elements
        this.isDragging = false;  // Flag for drag state
        this.lastY = 0;           // Last Y position during drag
    }

    addChild(child) {
        // Position the child relative to the content container
        child.scale = gameEngine.uiManager.scaleChild(this, child);
        this.children.push(child);
        this.scale = gameEngine.uiManager.scale(this);

        this.updateContentHeight();
    }

    updateContentHeight() {
        let maxHeight = 0;
        for (const child of this.children) {
            const bottom = child.scale.y - this.scale.y + child.scale.height;
            if (bottom > maxHeight) {
                maxHeight = bottom;
            }
        }
        this.contentHeight = maxHeight;
    }

    handleEvent(event) {
        // Handle input events (e.g., mouse wheel, touch)
        if (event.type === 'wheel') {
            this.scrollY -= event.deltaY;
            this.clampScroll();
        } else if (event.type === 'mousedown') {
            if (this.isWithinViewport(event.x, event.y)) {
                this.isDragging = true;
                this.lastY = event.y;
            }
        } else if (event.type === 'mousemove' && this.isDragging) {
            const deltaY = event.y - this.lastY;
            this.scrollY += deltaY;
            this.clampScroll();
            this.lastY = event.y;
        } else if (event.type === 'mouseup') {
            this.isDragging = false;
        }
    }

    isWithinViewport(x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    }

    clampScroll() {
        // Prevent scrolling beyond content boundaries
        const maxScrollY = this.contentHeight - this.height;
        if (this.scrollY < 0) {
            this.scrollY = 0;
        } else if (this.scrollY > maxScrollY) {
            this.scrollY = maxScrollY;
        }
    }

    update(deltaTime) {
        for (const child of this.children) {
            if (typeof child.update === 'function') {
                child.update(deltaTime);
            }
        }
    }

    render(graphicEngine, scaled) {
        const ctx = graphicEngine.ctx;
        const { x, y, width, height } = scaled;

        // Save the current context
        ctx.save();

        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.clip();

        ctx.translate(x, y - this.scrollY);

        // Render child elements
        for (const child of this.children) {
            if (typeof child.render === 'function') {
                child.render(graphicEngine, child.scale);
            }
        }

        ctx.restore();

        this.renderScrollbar(ctx);
    }

    renderScrollbar(ctx) {
        const scrollbarHeight = (this.height / this.contentHeight) * this.height;
        const scrollbarY = (this.scrollY / this.contentHeight) * this.height;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x + this.width - 10, this.y + scrollbarY, 8, scrollbarHeight);
        ctx.restore();
    }
}
