import {EventType} from "../../Event/EventType.mjs";

export class Particle {
    constructor(x, y, velocityX, velocityY, lifespan, size, color) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.lifespan = lifespan;
        this.age = 0;
        this.size = size;
        this.color = color;
    }

    update(deltaTime) {
        this.age += deltaTime;
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    render(ctx) {
        const opacity = 1 - this.age / this.lifespan;
        if (opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isAlive() {
        return this.age < this.lifespan;
    }
}
