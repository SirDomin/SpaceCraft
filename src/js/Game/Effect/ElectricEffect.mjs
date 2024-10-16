import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class ElectricEffect extends GameObject {
    constructor(x, y, radius) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.age = 0;
        this.duration = 1;
        this.radius = radius;
        this.lightningBolts = [];
        this.numBolts = 5;
        this.createLightningBolts();
    }

    createLightningBolts() {
        for (let i = 0; i < this.numBolts; i++) {
            const bolt = this.createLightningBolt();
            this.lightningBolts.push(bolt);
        }
    }

    createLightningBolt() {
        const segments = [];
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const endAngle = Math.random() * Math.PI * 2;
        const endX = startX + Math.cos(endAngle) * this.radius;
        const endY = startY + Math.sin(endAngle) * this.radius;

        const numSegments = 10;
        let prevX = startX;
        let prevY = startY;

        for (let i = 0; i < numSegments; i++) {
            const t = i / numSegments;
            const offset = (Math.random() - 0.5) * this.radius * 0.2;
            const x = startX + (endX - startX) * t + offset;
            const y = startY + (endY - startY) * t + offset;

            segments.push({ x: x, y: y });

            prevX = x;
            prevY = y;
        }

        segments.push({ x: endX, y: endY });

        return segments;
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

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 1;

        for (const bolt of this.lightningBolts) {
            ctx.beginPath();
            ctx.moveTo(bolt[0].x, bolt[0].y);
            for (let i = 1; i < bolt.length; i++) {
                ctx.lineTo(bolt[i].x, bolt[i].y);
            }
            ctx.stroke();
        }

        ctx.restore();
    }
}