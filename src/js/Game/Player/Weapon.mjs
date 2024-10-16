import { GameObject } from "../Object/GameObject.mjs";
import { EventType } from "../../Event/EventType.mjs";
import { Projectile } from "./Projectile.mjs";
import { EntityTypes } from "../Object/EntityTypes.mjs";

export class Weapon {
    constructor(player, config) {
        this.player = player;
        this.name = config.name || 'Unnamed Weapon';
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 10;
        this.height = config.height || 10;
        this.color = config.color || 'yellow';
        this.image = config.image || null;

        this.range = config.range || 300;
        this.damage = config.damage || 50;
        this.accuracy = config.accuracy || 100; // Percentage
        this.shotInterval = config.shotInterval || 0.5; // Seconds
        this.projectileSpeed = config.projectileSpeed || 200; // Units per second
        this.projectileType = config.projectileType || EntityTypes.PROJECTILE_PLAYER;
        this.projectilePiercing = config.piercing || 1;
        this.projectileForce = config.force || 1;
        this.projectileImage = config.projectileImage || null;
        this.soundEffect = config.soundEffect || null;
        this.burstCount = config.burstCount || 1;
        this.burstInterval = config.burstInterval || 0.1; // Seconds between shots in a burst
        this.reloadTime = config.reloadTime || 0; // Seconds to reload
        this.ammoCapacity = config.ammoCapacity || Infinity;
        this.projectileEffect = config.projectileEffect || null; // 'explosion' or 'electronic_charge'
        this.projectileEffectRadius = config.projectileEffectRadius || 0;
        this.projectileEffectParams = config.projectileEffectParams || {};
        this.ammo = this.ammoCapacity;

        this.firingMode = config.firingMode || 'single';
        this.burstCount = config.burstCount || 1;
        this.burstInterval = config.burstInterval || 0.1;
        this.spreadAngle = config.spreadAngle || 15;
        this.numberOfProjectiles = config.numberOfProjectiles || 1;

        this.shotCooldown = 0;
        this.reloadTime = config.reloadTime || 0;
        this.reloadCooldown = 0;
        this.burstShotsFired = 0;
        this.target = null;

        this.globalCoords = { x: this.x, y: this.y };
        this.lastRotation = 0;

        eventHandler.addEventHandler(EventType.VISIBLE_OBJECTS_TICK, (eventData) => {
            this.handleVisibleObjects(eventData.gameObjects);
        });
    }

    static fromJSON(player, jsonData) {
        return new Weapon(player, jsonData);
    }

    update(deltaTime) {
        if (deltaTime <= 0) return;

        if (this.reloadCooldown > 0) {
            this.reloadCooldown -= deltaTime;
            if (this.reloadCooldown <= 0) {
                this.ammo = this.ammoCapacity;
            }
            return;
        }

        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
        }

        if (this.shotCooldown <= 0 && this.ammo > 0) {
            this.fire();
            this.burstShotsFired++;

            if (this.burstShotsFired < this.burstCount) {
                this.shotCooldown = this.burstInterval;
            } else {
                this.shotCooldown = this.shotInterval;
                this.burstShotsFired = 0;
            }

            this.ammo--;
            if (this.ammo <= 0) {
                this.reloadCooldown = this.reloadTime;
            }
        }
    }

    fire() {
        if (!this.target) return;

        switch (this.firingMode) {
            case 'single':
                this.fireProjectile(this.target);
                break;

            case 'burst':
                this.fireProjectile(this.target);
                break;

            case 'spread':
                this.fireSpread();
                break;

            case 'cannon':
                this.fireCannon();
                break;

            default:
                this.fireProjectile(this.target);
                break;
        }

        if (this.soundEffect) {
            const audio = new Audio(this.soundEffect.src);
            audio.play();
        }
    }

    fireProjectile(target) {
        const projectile = this.createProjectile(target);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
    }

    fireSpread() {
        const angles = this.calculateSpreadAngles();
        for (const angle of angles) {
            const projectile = this.createProjectileAtAngle(angle);
            eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
        }
    }

    fireCannon() {
        const projectile = this.createProjectile(this.target);
        projectile.damage = this.damage * 2;
        projectile.speed = this.projectileSpeed * 0.5;
        projectile.width *= 2;
        projectile.height *= 2;
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
    }

    createProjectile(target) {
        const { normalizedDirectionX, normalizedDirectionY } = this.calculateDirection(target);
        const spawnX = this.globalCoords.x + normalizedDirectionX * (this.height / 2);
        const spawnY = this.globalCoords.y + normalizedDirectionY * (this.height / 2);

        const projectileConfig = {
            speed: this.projectileSpeed,
            damage: this.damage,
            effect: this.projectileEffect, // 'explosion' or 'electronic_charge'
            effectRadius: this.projectileEffectRadius,
            effectParams: this.projectileEffectParams,
        };

        const projectile = new Projectile(
            spawnX,
            spawnY,
            normalizedDirectionX,
            normalizedDirectionY,
            this.projectileType,
            projectileConfig
        );

        projectile.piercing = this.projectilePiercing;
        projectile.type = EntityTypes.PROJECTILE_PLAYER;
        projectile.force = this.projectileForce;

        projectile.speed = this.projectileSpeed;
        projectile.damage = this.damage;
        projectile.image = this.projectileImage;
        projectile.collisionObjects = [EntityTypes.ENEMY];

        return projectile;
    }

    createProjectileAtAngle(angle) {
        const radianAngle = angle * (Math.PI / 180);
        const cosAngle = Math.cos(radianAngle);
        const sinAngle = Math.sin(radianAngle);

        const spawnX = this.globalCoords.x + cosAngle * (this.height / 2);
        const spawnY = this.globalCoords.y + sinAngle * (this.height / 2);

        const projectile = new Projectile(
            spawnX,
            spawnY,
            cosAngle,
            sinAngle,
            this.projectileType
        );

        projectile.speed = this.projectileSpeed;
        projectile.damage = this.damage;
        projectile.force = this.projectileForce;
        projectile.image = this.projectileImage;
        projectile.collisionObjects = [EntityTypes.ENEMY];

        return projectile;
    }

    calculateSpreadAngles() {
        const centerAngle = this.getAngleToTarget();
        const halfSpread = this.spreadAngle / 2;
        const startAngle = centerAngle - halfSpread;
        const angleIncrement = this.spreadAngle / (this.numberOfProjectiles - 1);

        const angles = [];
        for (let i = 0; i < this.numberOfProjectiles; i++) {
            angles.push(startAngle + i * angleIncrement);
        }

        return angles;
    }

    calculateDirection(target) {
        const targetX = target.x + target.width / 2;
        const targetY = target.y + target.height / 2;
        const weaponX = this.globalCoords.x;
        const weaponY = this.globalCoords.y;

        const directionX = targetX - weaponX;
        const directionY = targetY - weaponY;
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        let normalizedDirectionX = directionX / magnitude;
        let normalizedDirectionY = directionY / magnitude;

        if (this.accuracy < 100) {
            const accuracyFactor = (100 - this.accuracy) / 100;
            const randomAngle = (Math.random() - 0.5) * Math.PI * 2 * accuracyFactor;
            const cosRandom = Math.cos(randomAngle);
            const sinRandom = Math.sin(randomAngle);
            const newDirectionX = normalizedDirectionX * cosRandom - normalizedDirectionY * sinRandom;
            const newDirectionY = normalizedDirectionX * sinRandom + normalizedDirectionY * cosRandom;
            normalizedDirectionX = newDirectionX;
            normalizedDirectionY = newDirectionY;
        }

        return { normalizedDirectionX, normalizedDirectionY };
    }

    getAngleToTarget() {
        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;
        const weaponX = this.globalCoords.x;
        const weaponY = this.globalCoords.y;

        const angleRad = Math.atan2(targetY - weaponY, targetX - weaponX);
        const angleDeg = angleRad * (180 / Math.PI);

        return angleDeg;
    }

    handleVisibleObjects(objects) {
        let closestObject = null;
        let closestDistance = this.range;
        const weaponCenterX = this.globalCoords.x + this.width / 2;
        const weaponCenterY = this.globalCoords.y + this.height / 2;

        const potentialTargets = objects.filter(obj => obj.type === EntityTypes.ENEMY);
        for (const obj of potentialTargets) {
            const objCenterX = obj.x + obj.width / 2;
            const objCenterY = obj.y + obj.height / 2;
            const distance = Math.hypot(weaponCenterX - objCenterX, weaponCenterY - objCenterY);

            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        }

        this.target = closestObject;
    }

    render(graphicEngine) {
    }

    renderAfterTransform(graphicEngine) {
        let angle = this.lastRotation || 0;
        if (this.target) {
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;
            const objectX = this.globalCoords.x;
            const objectY = this.globalCoords.y;
            angle = Math.atan2(targetY - objectY, targetX - objectX);
            this.lastRotation = angle;
        }
        graphicEngine.ctx.save();
        graphicEngine.ctx.translate(this.globalCoords.x, this.globalCoords.y);
        graphicEngine.ctx.rotate(angle);

        graphicEngine.ctx.rotate(-Math.PI / 2);

        if (this.image) {
            graphicEngine.ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            graphicEngine.drawSquare(
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height,
                this.color
            );
        }
        graphicEngine.ctx.restore();
        this.renderLineToPlayer(graphicEngine);

        this.renderLineToTarget(graphicEngine);
    }

    renderLineToPlayer(graphicEngine) {
        const playerX = this.player.x + this.player.width / 2;
        const playerY = this.player.y + this.player.height / 2;
        const objectX = this.globalCoords.x;
        const objectY = this.globalCoords.y;
        graphicEngine.ctx.strokeStyle = this.player.color;
        graphicEngine.ctx.lineWidth = 1;
        graphicEngine.ctx.beginPath();
        graphicEngine.ctx.moveTo(objectX, objectY);
        graphicEngine.ctx.lineTo(playerX, playerY);
        graphicEngine.ctx.stroke();
    }

    renderLineToTarget(graphicEngine) {
        if (!this.target) {
            return;
        }
        this.target.renderTarget(graphicEngine);
    }

    getVertices() {
        const cos = Math.cos(this.player.rotation - Math.PI / 2);
        const sin = Math.sin(this.player.rotation - Math.PI / 2);
        return this.getTransformedVertices(sin, cos);
    }

    getTransformedVertices(sin, cos) {
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;

        const x = this.x;
        const y = this.y;

        const transformedX = centerX + x * cos - y * sin;
        const transformedY = centerY + x * sin + y * cos;

        this.globalCoords = { x: transformedX, y: transformedY };

        return [this.globalCoords];
    }
}
