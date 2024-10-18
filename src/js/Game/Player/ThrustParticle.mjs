export class ThrustParticle {
    constructor(x, y, velocityX, velocityY, size, lifespan) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = size;       // Base size of the particle
        this.lifespan = lifespan;
        this.age = 0;
        this.rotation += (Math.random() - 0.5) * 0.2;
    }

    update(deltaTime) {
        this.age += deltaTime;

        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        const jitter = 0.5;
        this.x += (this.velocityX + (Math.random() - 0.5) * jitter) * deltaTime;
        this.y += (this.velocityY + (Math.random() - 0.5) * jitter) * deltaTime;
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;

        const lifeRatio = this.age / this.lifespan;

        const opacity = 1 - lifeRatio;
        if (opacity <= 0) return;

        const currentSize = this.size * (1 + lifeRatio * 0.5);

        ctx.save();
        ctx.globalAlpha = opacity;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, currentSize
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');     // White core
        gradient.addColorStop(0.2, 'rgba(0, 200, 255, 0.9)');   // Light blue
        gradient.addColorStop(0.5, 'rgba(100, 0, 255, 0.7)');   // Purple
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.ellipse(0, 0, currentSize * 1.5, currentSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isAlive() {
        return this.age < this.lifespan;
    }
}