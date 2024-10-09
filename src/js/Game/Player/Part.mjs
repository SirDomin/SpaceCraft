import {Resource} from "./Resource.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";
import {Projectile} from "./Projectile.mjs";

export class Part {
    constructor(player, x, y, width, height, color = 'yellow', resourceUsage = {}, name = '') {
        this.player = player;
        if (x < 0) {
            x = x - this.player.width;
        } else {
            x = x + width;
        }
        if (y < 0) {
            y += height + this.player.height / 2
        } else {
            y -= height
        }
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;

        this.active = true;

        this.name = name;
        this.color = color;

        this.baseX = - this.player.width / 2;
        this.baseY = - this.player.height / 2;

        this.x = this.baseX - this.relativeX;
        this.y = this.baseY - this.relativeY;
        this.range = 400;

        this.resourceUsage = {
            type: Resource[resourceUsage.type] || Resource.HEALTH,
            cost: resourceUsage.cost || -1,
            usage: resourceUsage.usage || 'second',
            interval: resourceUsage.interval || 5,
            currentInterval: 0,
        };

        this.globalCoords = {
            x: x,
            y: y,
        };

        this.projectiles = [

        ];

        this.accuracy = 97;

        this.shotInterval = 1000;
        this.lastShotTime = 0;

        this.lastRotation = 0;
        this.lastUpdateTime = 0;
        this.timeAccumulator = 0;

        this.target = null
        this.rotation = null;

        eventHandler.addEventHandler(EventType.VISIBLE_OBJECTS_TICK, (eventData) => {
            this.handleVisibleObjects(eventData.gameObjects);
        });

        return this;
    }

    static fromJSON(player, jsonData) {
        const { x, y, width, height, color, resourceUsage, name } = jsonData;
        return new Part(
            player,
            x || 0,
            y || 0,
            width || 50,
            height || 50,
            color || 'yellow',
            resourceUsage || {},
            name || '-'
        );
    }

    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        this.timeAccumulator += deltaTime;

        if (this.timeAccumulator >= 1000) {
            this.updateSecond();
            this.timeAccumulator -= 1000;
        }

        if (!this.lastShotTime) {
            this.lastShotTime = 0;
        }

        this.lastShotTime += deltaTime;
        if (this.lastShotTime >= this.shotInterval) {
            this.shot();
            this.lastShotTime = 0;
        }
    }

    shot() {
        if (!this.target) {
            return;
        }

        const projectileWidth = 5;
        const projectileHeight = 5;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;

        const playerCenterX = this.globalCoords.x;
        const playerCenterY = this.globalCoords.y;

        const directionX = targetX - playerCenterX;
        const directionY = targetY - playerCenterY;

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

        const pos = {
            x: playerCenterX + normalizedDirectionX * halfHeight * 1.1,
            y: playerCenterY + normalizedDirectionY * halfHeight * 1.1
        }

        const projectile = new Projectile(pos.x, pos.y, normalizedDirectionX, normalizedDirectionY, EntityTypes.PROJECTILE_PLAYER);

        projectile.collisionObjects = [
            EntityTypes.ENEMY
        ];

        projectile.damage = 5;

        // Dispatch projectile creation event
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
    }

    updateSecond() {
        if (this.active) {
            Object.entries(this.player.resources).forEach(([key, resource]) => {
                if (resource.type === this.resourceUsage.type && this.resourceUsage.usage === 'second') {
                    this.resourceUsage.currentInterval += 1;
                    if (this.resourceUsage.currentInterval >= this.resourceUsage.interval) {
                        this.resourceUsage.currentInterval = 0;

                        resource.addAmount(this.resourceUsage.cost);
                    }
                }
            });
        }
    }

    trigger() {

    }

    render(graphicEngine) {
        this.renderLineToPlayer(graphicEngine);
    }

    renderAfterTransform(graphicEngine) {
        let angle = this.lastRotation || 0;

        if (this.target) {
            const targetX = this.target.x + (this.target.width / 2);
            const targetY = this.target.y + (this.target.height / 2);
            const objectX = this.globalCoords.x;
            const objectY = this.globalCoords.y;

            angle = Math.atan2(targetY - objectY, targetX - objectX);
            this.lastRotation = angle;
        }

        graphicEngine.ctx.save();

        graphicEngine.ctx.translate(this.globalCoords.x, this.globalCoords.y);

        graphicEngine.ctx.rotate(angle);

        graphicEngine.drawSquare(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height,
            this.color
        );

        graphicEngine.ctx.restore();

        this.renderLineToTarget(graphicEngine);
    }

    handleVisibleObjects(objects) {
        let closestObject = null;
        let closestDistance = this.range;

        const thisCenterX = this.globalCoords.x + this.width / 2;
        const thisCenterY = this.globalCoords.y + this.height / 2;

        const inDoubleRange = objects.filter(obj => obj.type === EntityTypes.ENEMY).filter(obj => {
            return (
                obj.x + obj.width > this.globalCoords.x - this.range &&
                obj.x < this.globalCoords.x + this.width + this.range &&
                obj.y + obj.height > this.globalCoords.y - this.range &&
                obj.y < this.globalCoords.y + this.height + this.range
            );
        });

        inDoubleRange.forEach(obj => {
            const objCenterX = obj.x + obj.width / 2;
            const objCenterY = obj.y + obj.height / 2;

            const distance = Math.sqrt(
                Math.pow(thisCenterX - objCenterX, 2) + Math.pow(thisCenterY - objCenterY, 2)
            );

            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        });

        this.target = closestObject;

    }

    renderLineToPlayer(graphicEngine) {
        const playerX = (this.player.width / 2) - this.player.width / 2;
        const playerY = (this.player.height / 2) - this.player.height / 2;
        const objectX = this.x + (this.width / 2);
        const objectY = this.y + (this.height / 2);

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

        const targetX = this.target.x + (this.target.width / 2);
        const targetY = this.target.y + (this.target.height / 2);
        const objectX = this.globalCoords.x;
        const objectY = this.globalCoords.y;

        graphicEngine.ctx.strokeStyle = this.player.color;
        graphicEngine.ctx.lineWidth = 1;

        graphicEngine.ctx.beginPath();
        graphicEngine.ctx.moveTo(objectX, objectY);
        graphicEngine.ctx.lineTo(targetX, targetY);
        graphicEngine.ctx.stroke();
    }

    getVertices() {
        const cos = Math.cos(this.player.rotation - Math.PI / 2);
        const sin = Math.sin(this.player.rotation - Math.PI / 2);

        return this.getSimpleVertices(this.player, sin, cos);
    }

    getSimpleVertices(player, sin, cos) {
        const simple = {
            x: this.player.x + player.width / 2 + (this.x + this.width / 2) * cos - (this.y + this.height / 2) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width / 2) * sin + (this.y + this.height / 2) * cos
        }

        this.globalCoords = simple;

        return [simple];
    }

    getAdvancedVertices(player, sin, cos) {
        const topLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y + this.height) * cos
        };

        const topRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y +this.height ) * cos
        };

        const bottomRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y) * cos
        };

        const bottomLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y) * cos
        };

        return [topLeft, topRight, bottomRight, bottomLeft];
    }
}