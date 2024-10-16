import {MapParticle} from "./MapParticle.mjs";

export class ParticleSystem {
    constructor(numParticles, map) {
        this.particles = [];
        this.particleSpeedMax = 0.2;
        this.opacityMax = 0.3
        this.particleMaxSize = 1;
        this.particleMinSize = 0.2;
        for (let i = 0; i < numParticles; i++) {
            const size = Math.random() * this.particleMaxSize + this.particleMinSize;
            const speedX = (Math.random() - this.particleSpeedMax) * this.particleSpeedMax;
            const speedY = (Math.random() - this.particleSpeedMax) * this.particleSpeedMax;
            const opacity = Math.random() * this.opacityMax + this.opacityMax;
            this.particles.push(new MapParticle(Math.random() * map.width, Math.random() * map.height, size, speedX, speedY, opacity, map.width, map.height));
        }
    }

    update(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
    }

    updateAndRender(graphicEngine, gameEngine) {
        graphicEngine.setColor('white')

        gameEngine.getVisibleObjects(this.particles).forEach(particle => {
            particle.render(graphicEngine);
        });
    }
}