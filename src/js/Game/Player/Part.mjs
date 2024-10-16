import { Resource } from "./Resource.mjs";
import { EventType } from "../../Event/EventType.mjs";
import { EntityTypes } from "../Object/EntityTypes.mjs";
import { Projectile } from "./Projectile.mjs";

export class Part {
    constructor(player, x, y, width, height, color = 'yellow', resourceUsage = {}, name = '') {
        this.player = player;
        if (x < 0) {
            x = x - this.player.width;
        } else {
            x = x + width;
        }
        if (y < 0) {
            y += height + this.player.height / 2;
        } else {
            y -= height;
        }
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.name = name;
        this.color = color;
        this.baseX = -this.player.width / 2;
        this.baseY = -this.player.height / 2;
        this.x = this.baseX - this.relativeX;
        this.y = this.baseY - this.relativeY;
        this.range = 300;
        this.projectileDamage = 50;
        this.resourceUsage = {
            type: Resource[resourceUsage.type] || Resource.HEALTH,
            cost: resourceUsage.cost || -1,
            usage: resourceUsage.usage || 'second',
            interval: resourceUsage.interval || 5,
            currentInterval: 0,
        };
        this.shotSound = loader.getAudio('laser');
        this.globalCoords = { x: x, y: y };
        this.accuracy = 99;
        this.shotInterval = 0.05;
        this.shotCooldown = 0;
        this.timeAccumulator = 0;
        this.resourceUsageAccumulator = 0;
        this.target = null;
        this.rotation = null;

        eventHandler.addEventHandler(EventType.VISIBLE_OBJECTS_TICK, (eventData) => {
            this.handleVisibleObjects(eventData.gameObjects);
        });
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

    update(deltaTime) {
        this.timeAccumulator += deltaTime;
        this.resourceUsageAccumulator += deltaTime;
        if (this.resourceUsageAccumulator >= this.resourceUsage.interval) {
            this.updateResourceUsage();
            this.resourceUsageAccumulator -= this.resourceUsage.interval;
        }
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
        }
        if (this.shotCooldown <= 0) {

            this.shot();
            this.shotCooldown = this.shotInterval;
        }
    }

    shot() {
        if (!this.target) {
            return;
        }
        const audio = new Audio(this.shotSound.src);
        audio.play();

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
            y: playerCenterY + normalizedDirectionY * halfHeight * 1.1,
        };

        const projectile = new Projectile(pos.x, pos.y, normalizedDirectionX, normalizedDirectionY, EntityTypes.PROJECTILE_PLAYER);
        projectile.collisionObjects = [EntityTypes.ENEMY];
        projectile.damage = this.projectileDamage;
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
    }

    updateResourceUsage() {
        if (this.active) {
            const resource = this.player.resources[this.resourceUsage.type.toLowerCase()];
            if (resource && this.resourceUsage.usage === 'second') {
                resource.addAmount(this.resourceUsage.cost);
            }
        }
    }

    render(graphicEngine) {
        this.renderLineToPlayer(graphicEngine);
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
        graphicEngine.drawSquare(-this.width / 2, -this.height / 2, this.width, this.height, this.color);
        graphicEngine.ctx.restore();
        this.renderLineToTarget(graphicEngine);
    }

    handleVisibleObjects(objects) {
        let closestObject = null;
        let closestDistance = this.range;
        const thisCenterX = this.globalCoords.x + this.width / 2;
        const thisCenterY = this.globalCoords.y + this.height / 2;
        const inRangeObjects = objects
            .filter(obj => obj.type === EntityTypes.ENEMY)
            .filter(obj => {
                return (
                    obj.x + obj.width > this.globalCoords.x - this.range &&
                    obj.x < this.globalCoords.x + this.width + this.range &&
                    obj.y + obj.height > this.globalCoords.y - this.range &&
                    obj.y < this.globalCoords.y + this.height + this.range
                );
            });
        inRangeObjects.forEach(obj => {
            const objCenterX = obj.x + obj.width / 2;
            const objCenterY = obj.y + obj.height / 2;
            const distance = Math.hypot(thisCenterX - objCenterX, thisCenterY - objCenterY);
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
        const objectX = this.globalCoords.x + this.width / 2;
        const objectY = this.globalCoords.y + this.height / 2;
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
        return this.getSimpleVertices(this.player, sin, cos);
    }

    getSimpleVertices(player, sin, cos) {
        const simple = {
            x: this.player.x + player.width / 2 + (this.x + this.width / 2) * cos - (this.y + this.height / 2) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width / 2) * sin + (this.y + this.height / 2) * cos,
        };
        this.globalCoords = simple;
        return [simple];
    }

    getAdvancedVertices(player, sin, cos) {
        const topLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y + this.height) * cos,
        };
        const topRight = {
            x: this.player.x + player.width / 2 + this.x * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + this.x * sin + (this.y + this.height) * cos,
        };
        const bottomRight = {
            x: this.player.x + player.width / 2 + this.x * cos - this.y * sin,
            y: this.player.y + player.height / 2 + this.x * sin + this.y * cos,
        };
        const bottomLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - this.y * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + this.y * cos,
        };
        return [topLeft, topRight, bottomRight, bottomLeft];
    }
}
