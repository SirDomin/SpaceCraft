import { GameObject } from "./GameObject.mjs";
import { EntityTypes } from "./EntityTypes.mjs";
import { Resource } from "../Player/Resource.mjs";
import { Bar } from "../Interface/Element/Bar.mjs";
import { EventType } from "../../Event/EventType.mjs";
import { EnemyDestruction } from "./EnemyDestruction.mjs";
import {ExplosionEffect} from "../Effect/ExplosionEffect.mjs";
import {Projectile} from "../Player/Projectile.mjs";
import {Utils} from "../../Utils/Utils.mjs";

export class Enemy extends GameObject {
    constructor(x, y, w, h, maxHealth = 500) {
        super(x, y, w, h);

        this.type = EntityTypes.ENEMY;

        this.baseSpeed = 500;
        this.maxSpeed = this.baseSpeed * (0.8 + Math.random() * 0.4);
        this.acceleration = 100;
        this.velocityX = 0;
        this.velocityY = 0;

        this.force = 100;

        this.damage = 5;
        this.resistance = 5;

        this.activeEffects = [];

        this.targetImage = loader.getMediaFile('targetmark');
        this.isTarget = false;

        this.image = loader.getMediaFile('enemy1');

        this.desiredDistance = 200;

        this.resources = {
            health: new Resource(Resource.HEALTH, maxHealth, maxHealth),
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
        const width = this.width * 4;
        const height = this.height * 4;
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

            if (distance < this.desiredDistance) {
                let desiredVelocityX = -(desiredX / distance) * this.maxSpeed;
                let desiredVelocityY = -(desiredY / distance) * this.maxSpeed;

                const randomOffsetAngle = (Math.random() - 0.5) * (Math.PI / 4);
                const cosAngle = Math.cos(randomOffsetAngle);
                const sinAngle = Math.sin(randomOffsetAngle);

                const adjustedVelocityX = desiredVelocityX * cosAngle - desiredVelocityY * sinAngle;
                const adjustedVelocityY = desiredVelocityX * sinAngle + desiredVelocityY * cosAngle;

                desiredVelocityX = adjustedVelocityX;
                desiredVelocityY = adjustedVelocityY;

                // Calculate steering force
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

            } else {
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
        }

        this.shootAtPlayer(deltaTime);

        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.healthBar.x = this.x;
        this.healthBar.y = this.y + this.height * 1.1;

        this.healthBar.update(this.resources.health.amount(), this.resources.health.max(), 0);

        if (this.resources.health.amount() <= 0) {
            this.onDestroy();
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
                } else if (effect.type === 'acid') {
                    this.resources.health.removeAmount(effect.damageOverTime * deltaTime);
                }else if (effect.type === 'void_rift') {
                    this.applyGravitationalEffect(effect);

                }
                return true;
            } else {
                if (effect.type === 'void_rift') {
                    // this.velocityX = 0;
                    // this.velocityY = 0;
                }
                return false;
            }
        });

        if (!this.activeEffects.some(effect => effect.type === 'slow')) {
            this.maxSpeed = this.baseSpeed;
        }
    }

    applyGravitationalEffect(effect) {
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;
        const distanceX = enemyCenterX - effect.params.x;
        const distanceY = enemyCenterY - effect.params.y;
        const distance = Math.hypot(distanceX, distanceY);

        if (distance <= effect.params.radius) {
            const pullStrength = 1 - (distance / effect.params.radius);
            const angleToCenter = Math.atan2(distanceY, distanceX);
            const perpendicularAngle = angleToCenter + Math.PI / 2;

            const pullForce = pullStrength * 250;
            const steeringForceX = -Math.cos(angleToCenter) * pullForce * 0.02;
            const steeringForceY = -Math.sin(angleToCenter) * pullForce * 0.02;

            this.velocityX += steeringForceX;
            this.velocityY += steeringForceY;

            const rotationalForce = pullStrength * 30;
            const rotationForceX = Math.cos(perpendicularAngle) * rotationalForce * 0.01;
            const rotationForceY = Math.sin(perpendicularAngle) * rotationalForce * 0.01;

            this.velocityX += rotationForceX;
            this.velocityY += rotationForceY;
        }
    }

    applyStatusEffect(type, params) {
        const existingEffect = this.activeEffects.find(effect => effect.type === type);
        if (existingEffect) {
            existingEffect.duration = params.duration;
            existingEffect.percentage = params.percentage || existingEffect.percentage;
            existingEffect.damageOverTime = params.damageOverTime || existingEffect.damageOverTime;
        } else {
            this.activeEffects.push({
                type: type,
                percentage: params.percentage || 0,
                damageOverTime: params.damageOverTime || 0,
                duration: params.duration,
                params: params
            });
        }
    }

    onCollision(object) {
        if (object.type === EntityTypes.PROJECTILE_PLAYER) {
            this.resources.health.removeAmount(object.damage);

            let currentVelocityX = this.velocityX;
            let currentVelocityY = this.velocityY;

            let projectileVelocityX = object.speedX;
            let projectileVelocityY = object.speedY;

            let projectileMagnitude = Math.hypot(projectileVelocityX, projectileVelocityY);

            if (projectileMagnitude > 0) {
                projectileVelocityX /= projectileMagnitude;
                projectileVelocityY /= projectileMagnitude;

                let combinedForceX = projectileVelocityX * object.force;
                let combinedForceY = projectileVelocityY * object.force;

                let combinedVelocityX = (currentVelocityX * this.force + combinedForceX * object.force) / (this.force + object.force);
                let combinedVelocityY = (currentVelocityY * this.force + combinedForceY * object.force) / (this.force + object.force);

                this.velocityX = combinedVelocityX;
                this.velocityY = combinedVelocityY;
            }
        }

        if (object.type === EntityTypes.PLAYER) {
            // ExplosionEffect.explode(this.x + this.width / 2, this.y + this.height / 2, this.width, 10, 0);
            this.onDestroy();
            eventHandler.dispatchEvent(EventType.ENEMY_DESTROYED, this);
            EnemyDestruction.fromEnemy(this);
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        let glowSize = 0;
        if (this.isReplicator) {
            const pulseSpeed = 4;
            const time = Date.now() / 1000;

            glowSize = 10 + Math.sin(time * pulseSpeed) * 10;

            ctx.save();
            const gradient = ctx.createRadialGradient(centerX, centerY, this.width / 5, centerX, centerY, this.width / 2 + glowSize);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2 + glowSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.target) {
            ctx.save();

            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;

            const angleToTarget = Math.atan2(targetY - centerY, targetX - centerX);

            this.rotation = angleToTarget;

            ctx.translate(centerX, centerY);

            ctx.rotate(angleToTarget + Math.PI / 2);

            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);

            ctx.restore();
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        this.healthBar.render(graphicEngine);

        if (window.renderCollisions === true) {
            eventHandler.dispatchEvent(EventType.RENDER_COLLISION, this.getVertices());
        }
    }

    enableShooting() {
        this.isShooter = true;
        this.shootInterval = 2;
        this.timeSinceLastShot = 0;

        this.desiredDistance = 400;
    }

    getMiddlePoint() {
        return {x: this.x + this.width / 2, y: this.y + this.height / 2};
    }

    shootAtPlayer(deltaTime) {
        if(Math.random() < 0.9) {
            return;
        }

        if (this.isBurstShooter && this.target) {
            this.timeSinceLastShot += deltaTime;

            if (this.timeSinceLastShot >= this.shootInterval) {
                if (this.burstShotsFired < this.burstCount) {

                    const targetX = this.target.x + (this.target.width / 2) * Math.random();
                    const targetY = this.target.y + (this.target.height / 2) * Math.random();

                    const shootAngle = Math.atan2(targetY - this.y, targetX - this.x);

                    const {x, y} = this.getMiddlePoint();

                    const projectileSpeed = 5;
                    const projectile = new Projectile(
                        x, y,
                        Math.cos(shootAngle) * projectileSpeed, Math.sin(shootAngle) * projectileSpeed,
                        EntityTypes.PROJECTILE_ENEMY, {projectileType: 'PROJECTILE_BURST', lifespan: 8, damage: 5}
                    );
                    projectile.collisionObjects.push(EntityTypes.PLAYER);
                    eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);

                    this.burstShotsFired++;
                    this.timeSinceLastShot = this.shootInterval - this.burstDelay;
                } else {
                    this.burstShotsFired = 0;
                    this.timeSinceLastShot = 0;
                }
            }
        }

        if (this.isShooter && this.target) {
            this.timeSinceLastShot += deltaTime;
            if (this.timeSinceLastShot >= this.shootInterval) {
                const targetX = this.target.x + (this.target.width / 2) * Math.random();
                const targetY = this.target.y + (this.target.height / 2) * Math.random();

                const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);

                const {x, y} = this.getMiddlePoint();

                const projectile = new Projectile(
                    x, y,
                    Math.cos(baseAngle) * this.speed, Math.sin(baseAngle) * this.speed,
                    EntityTypes.PROJECTILE_ENEMY, {projectileType: 'PROJECTILE_SIMPLE', lifespan: 8, damage: 5}
                );
                projectile.collisionObjects.push(EntityTypes.PLAYER);
                eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
                this.timeSinceLastShot = 0;
            }
        }

        if (this.isSpreadShooter && this.target) {
            this.timeSinceLastShot += deltaTime;
            if (this.timeSinceLastShot >= this.shootInterval) {

                const targetX = this.target.x + (this.target.width / 2) * Math.random();
                const targetY = this.target.y + (this.target.height / 2) * Math.random();

                const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);

                for (let i = 0; i < this.spreadCount; i++) {
                    const angleOffset = this.spreadAngle * (i - Math.floor(this.spreadCount / 2));
                    const shootAngle = baseAngle + angleOffset;

                    const {x, y} = this.getMiddlePoint();

                    const projectileSpeed = 5;
                    const projectile = new Projectile(
                        x, y,
                        Math.cos(shootAngle) * projectileSpeed , Math.sin(shootAngle) * projectileSpeed,
                        EntityTypes.PROJECTILE_ENEMY, {projectileType: 'PROJECTILE_SPREAD', lifespan: 8, damage: 5}
                    );
                    projectile.collisionObjects.push(EntityTypes.PLAYER);
                    eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
                }

                this.timeSinceLastShot = 0;
            }
        }

        if (this.isHomingShooter && this.target) {
            this.timeSinceLastShot += deltaTime;

            if (this.timeSinceLastShot >= this.shootInterval) {
                const {x, y} = this.getMiddlePoint();

                const projectile = new Projectile(
                    x, y,
                    0, 0,
                    EntityTypes.PROJECTILE_ENEMY,
                    { target: this.target, homing: true, homingSpeed: 3, projectileType: 'PROJECTILE_HOMING', lifespan: 4, damage: 40}
                );
                projectile.collisionObjects.push(EntityTypes.PLAYER);
                projectile.collisionObjects.push(EntityTypes.PLAYER);
                eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);

                this.timeSinceLastShot = 0;
            }
        }

        if (this.isExplosiveShooter && this.target) {
            this.timeSinceLastShot += deltaTime;

            if (this.timeSinceLastShot >= this.shootInterval) {
                const targetX = this.target.x + (this.target.width / 2) * Math.random();
                const targetY = this.target.y + (this.target.height / 2) * Math.random();

                const shootAngle = Math.atan2(targetY - this.y, targetX - this.x);
                const projectileSpeed = 8;

                const {x, y} = this.getMiddlePoint();

                const projectile = new Projectile(
                    x, y,
                    Math.cos(shootAngle) * projectileSpeed, Math.sin(shootAngle) * projectileSpeed,
                    EntityTypes.PROJECTILE_ENEMY,
                    { explosionRadius: 50, explosionDamage: 20 , lifespan: 8, projectileType: 'PROJECTILE_EXPLODE', damage: 60}
                );
                projectile.collisionObjects.push(EntityTypes.PLAYER);

                eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);

                this.timeSinceLastShot = 0;
            }
        }
    }

    isAbleToShot() {
        return this.isShooter || this.isExplosiveShooter || this.isHomingShooter || this.isBurstShooter || this.isSpreadShooter;
    }

    enableExplosion() {
        this.isExploder = true;

        this.desiredDistance = 0;
    }

    enableExplosiveShot() {
        this.isExplosiveShooter = true;
        this.shootInterval = 6;
        this.timeSinceLastShot = 0;

        this.desiredDistance = 400;
    }

    enableSpreadShot() {
        this.isSpreadShooter = true;
        this.shootInterval = 3;
        this.timeSinceLastShot = 0;
        this.spreadCount = 5;
        this.spreadAngle = Math.PI / 6;

        this.desiredDistance = 400;
    }

    enableBurstShot() {
        this.isBurstShooter = true;
        this.shootInterval = 5;
        this.timeSinceLastShot = 0;
        this.burstCount = 3;
        this.burstDelay = 0.2;
        this.burstShotsFired = 0;

        this.desiredDistance = 400;
    }

    enableHomingShot() {
        this.isHomingShooter = true;
        this.shootInterval = 4;
        this.timeSinceLastShot = 0;

        this.desiredDistance = 400;
    }

    onDestroy() {
        if (this.isExploder) {
            ExplosionEffect.explode(this.x + this.width / 2, this.y + this.height / 2, this.width, 50, 10);
        }
        if (this.isReplicator) {
            const replicationCount = Utils.random(1, 5);
            for (let i = 0; i < replicationCount; i++) {
                const replicatedEnemy = new Enemy(this.x + Math.random() * 50, this.y + Math.random() * 50, this.width / 2, this.height / 2, this.resources.health.max() / 2);

                replicatedEnemy.enableShooting();
                replicatedEnemy.setTarget(this.target);

                eventHandler.dispatchEvent(EventType.OBJECT_CREATED, replicatedEnemy);
            }
        }
    }

    enableReplication() {
        this.isReplicator = true;
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
