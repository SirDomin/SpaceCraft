import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";
import {GameObject} from "../Object/GameObject.mjs";
import {ExplosionEffect} from "../Effect/ExplosionEffect.mjs";

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
        this.effect = config.effect || null;
        this.effectRadius = config.effectRadius || 0;
        this.effectParams = config.effectParams || {};
        this.projectileType = config.projectileType || null;
        this.targetHits = [];
        this.force = 0;
        this.piercing = config.piercing || 1;
        this.rotation = Math.atan2(speedY, speedX);
        this.lifespan = config.lifespan || 2;
        this.age = 0;
        this.length = this.height;
        this.maxOpacity = 1;
        this.config = config;
        this.homing = config.homing || false;
        this.explosionRadius = config.explosionRadius || 0;
        this.homingSpeed = config.homingSpeed || 0;
        this.target = config.target || null;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifespan) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }
        if (this.homing && this.target) {
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;
            const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);

            this.speedX = Math.cos(angleToTarget) * this.homingSpeed;
            this.speedY = Math.sin(angleToTarget) * this.homingSpeed;
        }

        this.x += this.speedX * this.speed * deltaTime;
        this.y += this.speedY * this.speed * deltaTime;
    }

    onCollision(object) {
        if (this.targetHits.includes(object.id)) {
            return;
        }
        if (this.collisionObjects.includes(object.type)) {
            this.targetHits.push(object.id);
            this.piercing--;

            eventHandler.dispatchEvent(EventType.PROJECTILE_HIT, {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                projectile: this,
            });

            object.onCollision(this);
        }
        if (this.projectileType === "PROJECTILE_EXPLODE" && this.config.explosionRadius) {
            ExplosionEffect.explode(this.x, this.y, this.config.explosionRadius, this.config.explosionDamage);
        }
        if (this.piercing <= 0) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;

        if (this.projectileType !== null) {
            eventHandler.dispatchEvent(`${EventType.PROJECTILE_RENDER}.${this.projectileType}`, this);
        }

        if (this.target && this.homing) {
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;

            const deltaX = targetX - this.x;
            const deltaY = targetY - this.y;

            this.rotation = Math.atan2(deltaY, deltaX);
        }

        const vertices = this.getVertices();
        if (vertices.length > 0) {
            ctx.save();

            ctx.beginPath();

            ctx.moveTo(vertices[0].x, vertices[0].y);

            vertices.forEach((vertex, index) => {
                if (index > 0) {
                    ctx.lineTo(vertex.x, vertex.y);
                }
            });

            ctx.lineTo(vertices[0].x, vertices[0].y);

            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.strokeStyle = 'red';
            ctx.lineWidth = this.width;

            ctx.fill();

            ctx.stroke();

            ctx.restore();
        }

        if (window.renderCollisions === true) {
            eventHandler.dispatchEvent(EventType.RENDER_COLLISION, this.getVertices())
        }
    }
}


//
// const laserStartX = this.x;
// const laserStartY = this.y;
// const laserEndX = this.x + Math.cos(this.rotation) * this.height;
// const laserEndY = this.y + Math.sin(this.rotation) * this.width;
//
// ctx.save();
//
// const gradient = ctx.createLinearGradient(laserStartX, laserStartY, laserEndX, laserEndY);
// gradient.addColorStop(0, `rgba(255, 0, 0, 1)`);
// gradient.addColorStop(1, `rgba(255, 255, 0, 0.5)`);
//
// ctx.strokeStyle = gradient;
// ctx.lineWidth = this.width;
//
// ctx.beginPath();
// ctx.moveTo(laserStartX, laserStartY);
// ctx.lineTo(laserEndX, laserEndY);
// ctx.stroke();
//
// ctx.restore();
