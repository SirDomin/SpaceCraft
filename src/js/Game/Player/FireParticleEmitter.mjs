import { FireParticle } from "./FireParticle.mjs";

export class FireParticleEmitter {
    constructor(x, y, emitRate, speed, particleLifespan, particleSize) {
        this.x = x;
        this.y = y;
        this.emitRate = emitRate;
        this.speed = speed;
        this.particleLifespan = particleLifespan;
        this.particleSize = particleSize;
        this.timeSinceLastEmit = 0;
        this.particles = [];
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        })

        this.particles = this.particles.filter(particle => {return particle.age < particle.lifespan})
    }

    update(deltaTime, spaceshipVelocityX, spaceshipVelocityY) {
        this.timeSinceLastEmit += deltaTime;

        const particlesToEmit = Math.floor(this.timeSinceLastEmit * this.emitRate);
        this.timeSinceLastEmit -= particlesToEmit / this.emitRate;

        for (let i = 0; i < particlesToEmit; i++) {
            const velocityX = spaceshipVelocityX * -0.5 + (Math.random() - 0.5) * this.speed;
            const velocityY = spaceshipVelocityY * -0.5 + (Math.random() - 0.5) * this.speed;

            const randomSize = this.particleSize * (0.8 + Math.random() * 0.4);
            const randomLifespan = this.particleLifespan * (0.7 + Math.random() * 0.6);

            const particle = new FireParticle(
                this.x, this.y, velocityX, velocityY, randomSize, randomLifespan
            );
            this.particles.push(particle);
        }
    }

    render(graphicEngine) {
        this.particles.forEach(particle => {
            particle.render(graphicEngine);
        })
    }

    renderOnMinimap() {
    }
}
