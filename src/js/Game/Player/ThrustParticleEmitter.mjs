import { ThrustParticle } from './ThrustParticle.mjs';

export class ThrustParticleEmitter {
    constructor() {
        this.particles = [];
        this.emitRate = 100;
    }

    update(deltaTime, player) {
        const speed = Math.hypot(player.velocityX, player.velocityY);

        if (speed > 0.1) {
            const particlesToEmit = this.emitRate * deltaTime;

            for (let i = 0; i < particlesToEmit; i++) {
                this.emitParticle(player, speed);
            }

        }
        this.particles.forEach(particle => particle.update(deltaTime));

        this.particles = this.particles.filter(particle => particle.isAlive());
    }

    emitParticle(player, playerSpeed) {
        const angleVariation = (Math.random() - 0.5) * 0.3;
        const angle = player.rotation + Math.PI + angleVariation;

        const speed = 50 + Math.random() * 50;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;

        const size = 10 + Math.random() * 5;
        const lifespan = 0.05 * (playerSpeed / player.maxSpeed);

        const engineOffsetX = -Math.cos(player.rotation) * (player.height / 2);
        const engineOffsetY = -Math.sin(player.rotation) * (player.height / 2);

        const x = player.x + player.width / 2 + engineOffsetX;
        const y = player.y + player.height / 2 + engineOffsetY;

        const particle = new ThrustParticle(x, y, velocityX, velocityY, size, lifespan);
        this.particles.push(particle);
    }

    render(graphicEngine) {
        graphicEngine.ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(particle => particle.render(graphicEngine));
        graphicEngine.ctx.globalCompositeOperation = 'source-over';
    }
}