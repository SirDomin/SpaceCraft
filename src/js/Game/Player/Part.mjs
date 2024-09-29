export class Part {
    constructor(player, x, y, width, height) {
        this.player = player;
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;

        if (x < 0) {
            this.x = -player.x - (this.width + x);
        } else {
            this.x = -player.x + player.width + this.x
        }

        if (y < 0) {
            this.y = player.y - (this.height + y);
        } else {
            this.y = player.y + player.height + this.y
        }

        this.color = 'red';
    }

    update() {

    }

    render(graphicEngine) {
        graphicEngine.drawSquare(-this.width / 2, - this.height / 2, this.width, this.height, this.color)
    }
}