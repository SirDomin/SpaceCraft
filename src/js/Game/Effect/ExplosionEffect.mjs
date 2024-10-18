import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class ExplosionEffect extends GameObject {
    constructor(x, y, radius, numParticles = 10, numFragments = 10, image = null) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.age = 0;
        this.duration = 1.5;
        this.radius = radius;
        this.image = image;

        this.particles = [];
        this.fragments = [];

        this.createParticles(numParticles);
        this.createFragments(numFragments);
    }

    static explode(x, y, radius, numParticles = 10, numFragments = 20, image = null) {
        const explosion = new ExplosionEffect(x, y, radius, numParticles, numFragments, image);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, explosion);
    }

    createParticles(numParticles) {
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: vx,
                vy: vy,
                radius: Math.random() * 3 + 2,
                age: 0,
                lifespan: Math.random() + 0.5,
                color: this.getRandomParticleColor(),
                type: this.getParticleType()
            });
        }
    }

    createFragments(numFragments) {
        if (!this.image) return;

        const fragmentCanvas = document.createElement('canvas');
        fragmentCanvas.width = this.image.width;
        fragmentCanvas.height = this.image.height;
        const fragmentCtx = fragmentCanvas.getContext('2d');
        fragmentCtx.drawImage(this.image, 0, 0);

        const fragmentWidth = this.image.width / Math.sqrt(numFragments);
        const fragmentHeight = this.image.height / Math.sqrt(numFragments);

        for (let i = 0; i < numFragments; i++) {
            const row = Math.floor(i / Math.sqrt(numFragments));
            const col = i % Math.floor(Math.sqrt(numFragments));

            const sx = col * fragmentWidth;
            const sy = row * fragmentHeight;

            const fragmentImage = fragmentCtx.getImageData(sx, sy, fragmentWidth, fragmentHeight);

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.fragments.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: vx,
                vy: vy,
                width: fragmentWidth,
                height: fragmentHeight,
                imageData: fragmentImage,
                age: 0,
                lifespan: Math.random() * 1 + 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 2,
                opacity: 1
            });
        }
    }

    getRandomParticleColor() {
        const colors = [
            'rgba(255, 69, 0, 1)',     // Orange red
            'rgba(255, 140, 0, 1)',    // Dark orange
            'rgba(255, 215, 0, 1)',    // Gold
            'rgba(255, 255, 255, 1)'   // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getParticleType() {
        const types = ['smoke', 'fire', 'spark'];
        return types[Math.floor(Math.random() * types.length)];
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.duration) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }

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
                fragment.rotation += fragment.rotationSpeed * deltaTime;
                fragment.opacity = 1 - (fragment.age / fragment.lifespan);
                return true;
            }
            return false;
        });
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const flashOpacity = Math.max(0, 1 - (this.age / (this.duration * 0.2)));

        if (flashOpacity > 0) {
            ctx.save();
            ctx.globalAlpha = flashOpacity * 0.5;
            ctx.fillStyle = 'rgba(255, 255, 200, 1)';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this.particles.forEach(particle => {
            const lifeRatio = particle.age / particle.lifespan;
            let opacity = 1 - lifeRatio;
            opacity = Math.max(0, opacity);

            ctx.save();
            ctx.globalAlpha = opacity;

            switch (particle.type) {
                case 'fire':
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'smoke':
                    ctx.fillStyle = `rgba(50, 50, 50, ${opacity * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'spark':
                    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particle.x - particle.vx * 0.05, particle.y - particle.vy * 0.05);
                    ctx.stroke();
                    break;
            }

            ctx.restore();
        });

        this.fragments.forEach(fragment => {
            ctx.save();
            ctx.globalAlpha = fragment.opacity;
            ctx.translate(fragment.x, fragment.y);
            ctx.rotate(fragment.rotation);

            const fragmentCanvas = document.createElement('canvas');
            fragmentCanvas.width = fragment.width;
            fragmentCanvas.height = fragment.height;
            const fragmentCtx = fragmentCanvas.getContext('2d');
            fragmentCtx.putImageData(fragment.imageData, 0, 0);

            ctx.drawImage(fragmentCanvas, -fragment.width / 2, -fragment.height / 2);

            ctx.restore();
        });
    }
}