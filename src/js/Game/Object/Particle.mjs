import {EventType} from "../../Event/EventType.mjs";

export class Particle {
    constructor(x, y, velocityX, velocityY, size, color, lifespan = 1000) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = size;
        this.color = color;
        this.lifespan = lifespan; // How long the particle lives (in milliseconds)
        this.age = 0; // Time that the particle has existed

        this.alpha = 1.0;
    }

    renderOnMinimap() {

    }

    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.age += deltaTime;

        this.alpha = 1 - (this.age / this.lifespan);

        if (this.age >= this.lifespan) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, 10, 10);

        // ctx.save();
        // ctx.globalAlpha = this.alpha;
        // ctx.fillStyle = this.color;
        //
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.restore();
    }
}
