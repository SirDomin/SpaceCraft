import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";
import {GameObject} from "../Object/GameObject.mjs";

export class Projectile extends GameObject {
    constructor(x, y, speedX, speedY, type, config = {}) {
        super(x, y, 2, 10);
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.speed = config.speed || 50;
        this.color = config.color || 'red';
        this.type = type;
        this.damage = config.damage || 50;
        this.effect = config.effect || null; // 'explosion' or 'electronic_charge'
        this.effectRadius = config.effectRadius || 0;
        this.effectParams = config.effectParams || {};
        this.targetHits = [];
        this.piercing = config.piercing || 1;
        this.angle = Math.atan2(speedY, speedX);
        this.lifespan = config.lifespan || 2;
        this.age = 0;
        this.length = this.height;

        this.maxOpacity = 1;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifespan) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }
        this.x += this.speedX * this.speed * deltaTime;
        this.y += this.speedY * this.speed * deltaTime;
    }

    onCollision(object) {
        if (this.targetHits.includes(object.id)) {
            return;
        }
        if (object.type === EntityTypes.ENEMY) {
            this.targetHits.push(object.id);
            this.piercing--;

            eventHandler.dispatchEvent(EventType.PROJECTILE_HIT, {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                projectile: this,
            });

            object.onCollision(this);
        }
        if (this.piercing <= 0) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const progress = this.age / this.lifespan;
        const opacity = this.maxOpacity * (1 - progress);
        const laserStartX = this.x;
        const laserStartY = this.y;
        const laserEndX = this.x + Math.cos(this.angle) * this.length;
        const laserEndY = this.y + Math.sin(this.angle) * this.length;
        if (opacity > 0) {
            ctx.save();
            ctx.globalAlpha = opacity;
            const gradient = ctx.createLinearGradient(laserStartX, laserStartY, laserEndX, laserEndY);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.moveTo(laserStartX, laserStartY);
            ctx.lineTo(laserEndX, laserEndY);
            ctx.stroke();
            ctx.restore();
        }
    }
}
