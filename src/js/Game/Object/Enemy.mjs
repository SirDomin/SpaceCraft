import { GameObject } from "./GameObject.mjs";
import { EntityTypes } from "./EntityTypes.mjs";
import { Resource } from "../Player/Resource.mjs";
import { Bar } from "../Interface/Element/Bar.mjs";
import { EventType } from "../../Event/EventType.mjs";
import { EnemyDestruction } from "./EnemyDestruction.mjs";

export class Enemy extends GameObject {
    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.type = EntityTypes.ENEMY;

        this.baseSpeed = 100;
        this.maxSpeed = this.baseSpeed * (0.8 + Math.random() * 0.4);
        this.acceleration = 50;
        this.velocityX = 0;
        this.velocityY = 0;

        this.damage = 5;
        this.resistance = 5;

        this.activeEffects = [];

        this.targetImage = loader.getMediaFile('targetmark');
        this.isTarget = false;

        this.image = loader.getMediaFile('enemy1');

        this.resources = {
            health: new Resource(Resource.HEALTH, 500, 500),
        };

        this.healthBar = new Bar(this.x, this.y + this.height * 1.1, this.width, 5, '#FF4C4C')
            .showValue(false)
            .setBackgroundColor('black');

        this.target = null;
    }

    setTarget(target) {
        this.target = target;
    }

    renderOnMinimap(minimap, graphicEngine) {
        const width = this.width * 2;
        const height = this.height * 2;
        graphicEngine.drawSquare(
            this.x * minimap.scale + minimap.x,
            this.y * minimap.scale + minimap.y,
            width * minimap.scale,
            height * minimap.scale,
            'red'
        );
    }

    update(deltaTime) {
        this.updateStatusEffects(deltaTime);

        if (this.target) {
            const desiredX = (this.target.x + this.target.width / 2) - (this.x + this.width / 2);
            const desiredY = (this.target.y + this.target.height / 2) - (this.y + this.height / 2);
            const distance = Math.hypot(desiredX, desiredY);

            let desiredVelocityX = (desiredX / distance) * this.maxSpeed;
            let desiredVelocityY = (desiredY / distance) * this.maxSpeed;

            const randomOffsetAngle = (Math.random() - 0.5) * (Math.PI / 4);
            const cosAngle = Math.cos(randomOffsetAngle);
            const sinAngle = Math.sin(randomOffsetAngle);

            const adjustedVelocityX = desiredVelocityX * cosAngle - desiredVelocityY * sinAngle;
            const adjustedVelocityY = desiredVelocityX * sinAngle + desiredVelocityY * cosAngle;

            desiredVelocityX = adjustedVelocityX;
            desiredVelocityY = adjustedVelocityY;

            const steeringX = desiredVelocityX - this.velocityX;
            const steeringY = desiredVelocityY - this.velocityY;

            const steeringMagnitude = Math.hypot(steeringX, steeringY);
            const maxSteeringForce = this.acceleration * deltaTime;

            let steeringForceX = steeringX;
            let steeringForceY = steeringY;

            if (steeringMagnitude > maxSteeringForce) {
                steeringForceX = (steeringX / steeringMagnitude) * maxSteeringForce;
                steeringForceY = (steeringY / steeringMagnitude) * maxSteeringForce;
            }

            this.velocityX += steeringForceX;
            this.velocityY += steeringForceY;

            const speed = Math.hypot(this.velocityX, this.velocityY);
            if (speed > this.maxSpeed) {
                this.velocityX = (this.velocityX / speed) * this.maxSpeed;
                this.velocityY = (this.velocityY / speed) * this.maxSpeed;
            }
        }

        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.healthBar.x = this.x;
        this.healthBar.y = this.y + this.height * 1.1;

        this.healthBar.update(this.resources.health.amount(), this.resources.health.max(), 0);

        if (this.resources.health.amount() <= 0) {
            eventHandler.dispatchEvent(EventType.ENEMY_DESTROYED, this);
            EnemyDestruction.fromEnemy(this);
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    updateStatusEffects(deltaTime) {
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.duration -= deltaTime;
            if (effect.duration > 0) {
                if (effect.type === 'slow') {
                    this.maxSpeed = this.baseSpeed * (1 - (effect.percentage / 100));
                }
                return true;
            } else {
                return false;
            }
        });

        if (!this.activeEffects.some(effect => effect.type === 'slow')) {
            this.maxSpeed = this.baseSpeed;
        }
    }

    applyStatusEffect(type, params) {
        this.activeEffects.push({
            type: type,
            percentage: params.percentage,
            duration: params.duration,
        });
    }

    onCollision(object) {
        if (object.type === EntityTypes.PROJECTILE_PLAYER) {
            this.resources.health.removeAmount(object.damage);

            let directionX = object.speedX;
            let directionY = object.speedY;

            let magnitude = Math.hypot(directionX, directionY);

            if (magnitude > 0) {
                directionX /= magnitude;
                directionY /= magnitude;

                this.velocityX += directionX * object.force;
                this.velocityY += directionY * object.force;
            }
        } else if (object.type === EntityTypes.EXPLOSION) {
            this.resources.health.removeAmount(object.damage);

            let directionX = (this.x + this.width / 2) - object.x;
            let directionY = (this.y + this.height / 2) - object.y;

            let magnitude = Math.hypot(directionX, directionY);

            if (magnitude > 0) {
                directionX /= magnitude;
                directionY /= magnitude;

                const force = object.force || 10;
                this.velocityX += directionX * force;
                this.velocityY += directionY * force;
            }
        }
    }

    render(graphicEngine) {
        graphicEngine.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.healthBar.render(graphicEngine);
    }

    renderTarget(graphicEngine) {
        graphicEngine.ctx.globalAlpha = 0.7;
        graphicEngine.ctx.drawImage(this.targetImage, this.x, this.y, this.width, this.height);
        graphicEngine.ctx.globalAlpha = 1.0;
    }

    attackTarget() {
        // Implement attack logic if needed
    }
}
