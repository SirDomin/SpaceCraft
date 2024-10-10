export class UIElement {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.enabled = true;
    }

    render(graphicEngine) {
        // Render logic for this element
        if (this.visible) {
            // Specific render code for each element will go here
        }
    }

    update(deltaTime) {
        // Optional update logic for animated UI elements
    }

    checkClick(mouseX, mouseY) {
        // Check if the mouse coordinates are inside the element's boundaries
        return this.enabled &&
            mouseX >= this.x &&
            mouseX <= this.x + this.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height;
    }

    onClick() {
        // Custom behavior for each UI element on click
    }
}