export class Part {
    constructor(player, x, y, width, height) {
        this.player = player;
        if (x < 0) {
            x = x - this.player.width;
        } else {
            x = x + width;
        }
        if (y < 0) {
            y += height + this.player.height / 2
        } else {
            y -= height
        }
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;

        this.color = 'yellow';

        this.baseX = - this.player.width / 2;
        this.baseY = - this.player.height / 2;

        this.x = this.baseX - this.relativeX;
        this.y = this.baseY - this.relativeY;

        return this;
    }

    update() {

    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    getVertices() {
        const player = this.player;

        const cos = Math.cos(this.player.rotation - Math.PI / 2);
        const sin = Math.sin(this.player.rotation - Math.PI / 2);

        const x = this.player.x + this.x;

        const topLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y + this.height) * cos
        };

        const topRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y +this.height ) * cos
        };

        const bottomRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y) * cos
        };

        const bottomLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y) * cos
        };

        return [topLeft, topRight, bottomRight, bottomLeft];
    }
}