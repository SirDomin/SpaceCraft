import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class ExplosionEffect extends GameObject {
    constructor(x, y, radius, numParticles = 50, numFragments = 10) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.age = 0;
        this.duration = 1.5; // Duration of the explosion in seconds
        this.radius = radius;

        this.particles = [];
        this.fragments = [];

        this.createParticles(numParticles);
        this.createFragments(numFragments);
    }

    createParticles(numParticles) {
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50; // Random speed for particles
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: vx,
                vy: vy,
                radius: Math.random() * 3 + 2, // Particle size
                age: 0,
                lifespan: Math.random() * 0.8 + 0.3, // Random lifespan for particles
                color: this.getRandomExplosionColor()
            });
        }
    }

    createFragments(numFragments) {
        for (let i = 0; i < numFragments; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.fragments.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: vx,
                vy: vy,
                width: Math.random() * 8 + 4, // Fragment size
                height: Math.random() * 8 + 4,
                age: 0,
                lifespan: Math.random() * 1 + 0.5, // Longer lifespan for fragments
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2 // Random rotation speed
            });
        }
    }

    getRandomExplosionColor() {
        const colors = ['rgba(255, 69, 0, 1)', 'rgba(255, 140, 0, 1)', 'rgba(255, 215, 0, 1)', 'rgba(255, 255, 255, 1)'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.duration) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.age += deltaTime;
            if (particle.age < particle.lifespan) {
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                return true;
            }
            return false;
        });

        this.fragments = this.fragments.filter(fragment => {
            fragment.age += deltaTime;
            if (fragment.age < fragment.lifespan) {
                fragment.x += fragment.vx * deltaTime;
                fragment.y += fragment.vy * deltaTime;
                fragment.rotation += fragment.rotationSpeed;
                return true;
            }
            return false;
        });
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const opacity = 1 - (this.age / this.duration);

        ctx.save();
        ctx.globalAlpha = opacity;

        this.particles.forEach(particle => {
            const particleOpacity = 1 - (particle.age / particle.lifespan);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particleOpacity;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.fragments.forEach(fragment => {
            ctx.globalAlpha = 1 - (fragment.age / fragment.lifespan);
            ctx.save();
            ctx.translate(fragment.x, fragment.y);
            ctx.rotate(fragment.rotation);
            ctx.fillStyle = '#5C4033'; // Brown color for debris
            ctx.fillRect(-fragment.width / 2, -fragment.height / 2, fragment.width, fragment.height);
            ctx.restore();
        });

        ctx.restore();
    }
}