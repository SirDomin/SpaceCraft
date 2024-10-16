import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class AcidSplashEffect extends GameObject {
    constructor(x, y, radius) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.age = 0;
        this.duration = 1;
        this.radius = radius;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.duration) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const opacity = 1 - (this.age / this.duration);

        // Step 1: Create the irregular splash shape
        const numSplashes = 20; // Number of splash points
        const splashRadius = this.radius * 0.7 + Math.random() * (this.radius * 0.3); // Vary the splash radius
        const points = [];

        for (let i = 0; i < numSplashes; i++) {
            const angle = (Math.PI * 2 * i) / numSplashes; // Distribute points evenly around the circle
            const randomLength = splashRadius + Math.random() * (this.radius * 0.4); // Vary length of splashes

            const x = this.x + this.radius + Math.cos(angle) * randomLength;
            const y = this.y + this.radius + Math.sin(angle) * randomLength;
            points.push({ x, y });
        }

        const gradient = ctx.createRadialGradient(
            this.x + this.radius,
            this.y + this.radius,
            0,
            this.x + this.radius,
            this.y + this.radius,
            this.radius
        );

        gradient.addColorStop(0, `rgba(0, 255, 0, ${0.5 * opacity})`);
        gradient.addColorStop(1, `rgba(0, 100, 0, ${0.2 * opacity})`);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        const numDroplets = 10 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numDroplets; i++) {
            const dropletX = this.x + this.radius + (Math.random() - 0.5) * this.radius * 3;
            const dropletY = this.y + this.radius + (Math.random() - 0.5) * this.radius * 3;
            const dropletRadius = Math.random() * (this.radius * 0.1);

            ctx.globalAlpha = Math.random() * 0.6 * opacity;
            ctx.beginPath();
            ctx.arc(dropletX, dropletY, dropletRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 0, 0.7)`;
            ctx.fill();
        }

        ctx.restore();
    }
}