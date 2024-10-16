import {GameObject} from "./GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class Hitmark extends GameObject{
    constructor(x, y, width, height, radius = 100, particles = 50, lifetime = 200) {
        super(x, y, width, height);

        this.x -= this.width / 2;
        this.y -= this.height / 2;
        this.lifetime = lifetime;
        this.creationTime = Date.now();

        this.maxRadius = radius;

        this.particles = [];
        this.numParticles = particles;

        this.generateParticles();
    }

    static hit(x, y, radius) {
        const hitmark = new Hitmark(x, y, 10, 10, radius, 30, 500);

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);
    }

    generateParticles() {
        for (let i = 0; i < this.numParticles; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 2 + 1;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                velocityX: velocityX,
                velocityY: velocityY,
                size: Math.random() * (this.maxRadius / 100) + 1,
                life: Math.random() * 500 + 500,
                creationTime: Date.now(),
            });
        }
    }

    isExpired() {
        return (Date.now() - this.creationTime) > this.lifetime;
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const timePassed = Date.now() - this.creationTime;
        const progress = timePassed / this.lifetime;

        const currentRadius = this.maxRadius * progress;
        const opacity = 1 - progress;

        if (opacity > 0) {
            ctx.save();
            ctx.beginPath();

            const gradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, currentRadius * 0.3,
                this.x + this.width / 2, this.y + this.height / 2, currentRadius
            );
            gradient.addColorStop(0, `rgba(255, 165, 0, ${opacity})`); // inner orange
            gradient.addColorStop(1, `rgba(255, 69, 0, 0)`); // outer transparent red

            ctx.fillStyle = gradient;
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this.renderParticles(ctx);
    }

    renderParticles(ctx) {
        for (let particle of this.particles) {
            const timePassed = Date.now() - particle.creationTime;
            const particleProgress = timePassed / particle.life;
            const particleOpacity = 1 - particleProgress;

            if (particleOpacity > 0) {
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;

                ctx.save();
                ctx.globalAlpha = particleOpacity;
                ctx.fillStyle = `rgba(255, 255, 255, ${particleOpacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        this.particles = this.particles.filter(p => (Date.now() - p.creationTime) < p.life);
    }

    update() {
        if (this.isExpired()) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }
}