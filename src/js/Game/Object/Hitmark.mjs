import {GameObject} from "./GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class Hitmark extends GameObject {
    constructor(x, y, width, height, radius = 100, particles = 50, lifetime = 0.2) {
        super(x, y, width, height);

        this.x -= this.width / 2;
        this.y -= this.height / 2;
        this.lifetime = lifetime;
        this.elapsedTime = 0;
        this.maxRadius = radius;

        this.particles = [];
        this.numParticles = particles;

        this.generateParticles();
    }

    static hit(x, y, radius) {
        const hitmark = new Hitmark(x, y, 10, 10, radius, 30, 0.2);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);
    }

    generateParticles() {
        for (let i = 0; i < this.numParticles; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 200 + 1;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                velocityX: velocityX,
                velocityY: velocityY,
                size: Math.random() * (this.maxRadius / 100) + 1,
                life: Math.random() * 500 + 500,
                elapsedTime: 0
            });
        }
    }

    isExpired() {
        return this.elapsedTime > this.lifetime;
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const progress = this.elapsedTime / this.lifetime;
        const currentRadius = this.maxRadius * progress;
        const opacity = 1 - progress;

        if (opacity > 0) {
            ctx.save();
            ctx.beginPath();

            const gradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, currentRadius * 0.3,
                this.x + this.width / 2, this.y + this.height / 2, currentRadius
            );
            gradient.addColorStop(0, `rgba(255, 165, 0, ${opacity})`);
            gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);

            ctx.fillStyle = gradient;
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this.renderParticles(ctx);
    }

    renderParticles(ctx) {
        for (let particle of this.particles) {
            const particleProgress = particle.elapsedTime / particle.life;
            const particleOpacity = 1 - particleProgress;

            if (particleOpacity > 0) {
                ctx.save();
                ctx.globalAlpha = particleOpacity;
                ctx.fillStyle = `rgba(255, 255, 255, ${particleOpacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        this.particles = this.particles.filter(p => p.elapsedTime < p.life);
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;

        for (let particle of this.particles) {
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.elapsedTime += deltaTime * 1000;
        }

        if (this.isExpired()) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }
}