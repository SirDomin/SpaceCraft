import { GameObject } from "../Object/GameObject.mjs";

export class FireParticle extends GameObject {
    constructor(x, y, velocityX, velocityY, size, lifespan) {
        super(x, y, size, size);
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.lifespan = lifespan;
        this.age = 0;
        this.initialSize = size;
        this.size = 0;
        this.pulse = Math.random() * 0.3 + 0.7;
    }

    update(deltaTime) {
        this.age += deltaTime;

        this.x += this.velocityX * deltaTime * (0.95 + Math.random() * 0.1);
        this.y += this.velocityY * deltaTime * (0.95 + Math.random() * 0.1);

        const lifeRatio = this.age / this.lifespan;
        this.size = this.initialSize * (1 - lifeRatio) * this.pulse;

        if (this.age >= this.lifespan) {
            // eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;

        const opacity = 1 - (this.age / this.lifespan);
        ctx.save();
        ctx.globalAlpha = opacity;

        const gradient = ctx.createRadialGradient(
            this.x + this.size / 2, this.y + this.size / 2, this.size * 0.1,
            this.x + this.size / 2, this.y + this.size / 2, this.size
        );

        gradient.addColorStop(0, `rgba(0, 255, 255, 1)`);
        gradient.addColorStop(0.2, `rgba(0, 150, 255, 1)`);
        gradient.addColorStop(0.5, `rgba(0, 255, 100, 0.9)`);
        gradient.addColorStop(0.7, `rgba(255, 165, 0, 0.8)`);
        gradient.addColorStop(1, `rgba(255, 0, 255, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.fill();

        ctx.restore();
    }
}
