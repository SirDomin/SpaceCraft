export class Particle {
    constructor(x, y, size, speedX, speedY, opacity, mapWidth, mapHeight) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.opacity = opacity;

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }

    update(deltaTime) {
        this.x += this.speedX * deltaTime;
        this.y += this.speedY * deltaTime;

        if (this.x < 0 || this.x > this.mapWidth) this.x = (this.x + this.mapWidth) % this.mapWidth;
        if (this.y < 0 || this.y > this.mapHeight) this.y = (this.y + this.mapHeight) % this.mapHeight;
    }

    render(graphicEngine) {
        graphicEngine.setAlpha(this.opacity);
        graphicEngine.drawCircle(this.x, this.y, this.size);
        graphicEngine.setAlpha(1.0);
    }
}
