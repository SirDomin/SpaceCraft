import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class VoidRiftEffect extends GameObject {
    constructor(x, y, radius) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.age = 0;
        this.duration = 10;
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
        const opacity = 0.7 * (1 - this.age / this.duration);

        ctx.save();
        ctx.globalAlpha = opacity;

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        const numWaves = 3;
        for (let i = 1; i <= numWaves; i++) {
            const waveRadius = this.radius * (0.5 + 0.3 * i);
            ctx.strokeStyle = `rgba(128, 0, 128, ${opacity * (1 - i / numWaves)})`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        const swirlRadius = this.radius * 0.8;
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const angleOffset = (this.age / this.duration) * Math.PI * 2 * (i + 1) * 0.3;
            ctx.beginPath();
            ctx.arc(
                this.x + this.radius,
                this.y + this.radius,
                swirlRadius - i * 10,
                angleOffset,
                angleOffset + Math.PI * 1.5
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}