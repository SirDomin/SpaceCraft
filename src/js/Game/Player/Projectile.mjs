import {GameObject} from "../Object/GameObject.mjs";
import {EventHandler} from "../../Event/EventHandler.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";

export class Projectile extends GameObject {
    constructor(x, y, speedX, speedY, type) {
        super(x, y,2 , 10);

        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.speed = 5;
        this.color = 'red';
        this.type = type;

        this.targetHits = [];
        this.piercing = 2;
        this.force = 2;

        this.angle = Math.atan2(speedY, speedX);
        this.maxOpacity = 1;

        this.lifespan = 2000;
        this.creationTime = Date.now();

        this.lifetime = 5000;
        this.length = this.height;
        this.maxOpacity = 1;
    }

    isExpired() {
        return (Date.now() - this.creationTime) > this.lifespan;
    }

    update() {
        if (this.isExpired()) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }
        this.x += this.speedX * this.speed;
        this.y += this.speedY * this.speed;
    }

    onCollision(object) {
        if (this.targetHits.find(hitId => hitId === object.id)) {
            return;
        }
        if (object.type === EntityTypes.ENEMY) {
            this.targetHits.push(object.id);
            this.piercing--;

            eventHandler.dispatchEvent(EventType.PROJECTILE_HIT, {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
            });

            object.onCollision(this);
        }

        if (this.piercing <= 0) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        const timePassed = Date.now() - this.creationTime;
        const progress = timePassed / this.lifetime;

        const opacity = this.maxOpacity * (1 - progress);
        const laserStartX = this.x;
        const laserStartY = this.y;

        const laserEndX = this.x + Math.cos(this.angle) * this.length;
        const laserEndY = this.y + Math.sin(this.angle) * this.length;

        if (opacity > 0) {
            // Draw the laser beam
            ctx.save();
            ctx.globalAlpha = opacity;

            // Add glowing effect using a gradient
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