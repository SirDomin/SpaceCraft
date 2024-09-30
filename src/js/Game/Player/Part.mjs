export class Part {
    constructor(player, x, y, width, height) {
        this.player = player;
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;

        this.color = 'yellow';

        this.baseX = - this.player.width / 2;
        this.baseY = - this.player.height / 2;

        this.x = this.baseX - this.relativeX;
        this.y = this.baseY - this.relativeY;
    }

    update() {

    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color)
    }

    getVertices() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        // Cosine and sine for rotation (adjusting based on player's rotation if needed)
        const cos = Math.cos(this.player.rotation);
        const sin = Math.sin(this.player.rotation);

        // Calculate each corner vertex with respect to rotation
        const topLeft = {
            x: this.player.x + (this.relativeX - halfWidth) * cos - (this.relativeY - halfHeight) * sin,
            y: this.player.y + (this.relativeX - halfWidth) * sin + (this.relativeY - halfHeight) * cos
        };
        const topRight = {
            x: this.player.x + (this.relativeX + halfWidth) * cos - (this.relativeY - halfHeight) * sin,
            y: this.player.y + (this.relativeX + halfWidth) * sin + (this.relativeY - halfHeight) * cos
        };
        const bottomRight = {
            x: this.player.x + (this.relativeX + halfWidth) * cos - (this.relativeY + halfHeight) * sin,
            y: this.player.y + (this.relativeX + halfWidth) * sin + (this.relativeY + halfHeight) * cos
        };
        const bottomLeft = {
            x: this.player.x + (this.relativeX - halfWidth) * cos - (this.relativeY + halfHeight) * sin,
            y: this.player.y + (this.relativeX - halfWidth) * sin + (this.relativeY + halfHeight) * cos
        };

        return [topLeft, topRight, bottomRight, bottomLeft];
    }
}