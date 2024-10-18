import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {Part} from "./Part.mjs";
import {Bar} from "../Interface/Element/Bar.mjs";
import {WeaponSlot} from "../Interface/Element/WeaponSlot.mjs";
import {InterfaceType} from "../Interface/InterfaceType.mjs";
import {Resource} from "./Resource.mjs";
import {Projectile} from "./Projectile.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";
import {Weapon} from "./Weapon.mjs";
import {UIProgressBar} from "../Interface/Element/UIProgressBar.mjs";
import {Hitmark} from "../Object/Hitmark.mjs";
import {ExplosionEffect} from "../Effect/ExplosionEffect.mjs";
import {EnemyDestruction} from "../Object/EnemyDestruction.mjs";
import {ThrustParticleEmitter} from "./ThrustParticleEmitter.mjs";

export class Player extends GameObject {

    constructor(x,y, w, h) {
        super(x, y, w, h);

        this.rotation = -Math.PI / 2;
        this.rotationSpeed = 250;
        this.acceleration = 1000;
        this.deceleration = 300;
        this.maxSpeed = 400;
        this.velocityX = 0;
        this.velocityY = 0;

        this.maxPartDistance = 100;

        this.weaponSlots = [];
        this.weapons = [
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Plasma Rifle')),
            Weapon.fromJSON(this, loader.getResource('weapons', 'Single Rifle')),
            Weapon.fromJSON(this, loader.getResource('weapons', 'Rapid Fire Cannon')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Plasma Rifle')),
            Weapon.fromJSON(this, loader.getResource('weapons', 'Spread Shot')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'EMP Blaster')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Cannon Launcher')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Acidic Torpedo Launcher')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Void Rift Generator')),
            // Weapon.fromJSON(this, loader.getResource('weapons', 'Cannon Launcher')),
            // Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade 3')),
            // Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade 4')),
            // Part.fromJSON(this, loader.getResource('parts', 'Engine 2')),
            // Part.fromJSON(this, loader.getResource('parts', 'Fuel Tank')),
            // new Part(this, 30, -100, 10, 10),
            // new Part(this, 30, 30, 10, 10),
            // new Part(this, -30, -100, 10, 10),
            // new Part(this,  -30, 30, 10, 10),
        ];

        this.image = loader.getMediaFile('player0');

        this.resources = {
            shield: new Resource(Resource.SHIELD, 100, 50),
            health: new Resource(Resource.HEALTH, 100, 33)
        }

        this.currentPart = null;


        this.collisionObjects = [
            EntityTypes.ENEMY,
            EntityTypes.COLLECTIBLE
        ]

        this.type = EntityTypes.PLAYER;

        this.mapBorders = {
            width: 0,
            height: 0
        }

        this.camera = {
            width: 0,
            height: 0
        }

        this.cameraPos = null;

        this.experience = 0;

        this.color = 'blue'

        eventHandler.addEventHandler(EventType.PLAYER_RENDER, (eventData) => {
            this.render(eventData.graphicEngine)
        }, 'player.render', false, 10).debug = false;

        this.setupInputHandlers();

        const keyCodes = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48];

        keyCodes.forEach((keyCode, index) => {
            eventHandler.addKeyHandler(keyCode, () => {
                this.activateSlot(index);
            }, true);
        });

        this.thrustEmitter = new ThrustParticleEmitter();

        eventHandler.dispatchEvent(EventType.PLAYER_CREATE, {object: this})
    }

    setupInputHandlers() {
        eventHandler.addKeyHandler(37, deltaTime => {
            const angleDelta = (-this.rotationSpeed * deltaTime * Math.PI) / 180;
            this.rotate(angleDelta);
        }, false).debug = false;

        eventHandler.addKeyHandler(39, deltaTime => {
            const angleDelta = (this.rotationSpeed * deltaTime * Math.PI) / 180;
            this.rotate(angleDelta);
        }).debug = false;

        eventHandler.addKeyHandler(32, () => {
            this.shoot();
        }).debug = false;

        eventHandler.addKeyHandler(38, deltaTime => {
            this.accelerate(deltaTime);
        }).debug = false;

        eventHandler.addKeyHandler(40, deltaTime => {
            this.decelerate(deltaTime);
        }).debug = false;

        const keyCodes = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48];
        keyCodes.forEach((keyCode, index) => {
            eventHandler.addKeyHandler(keyCode, () => {
                this.activateSlot(index);
            }, true);
        });
    }

    accelerate(deltaTime) {
        const accelerationX = Math.cos(this.rotation) * this.acceleration * deltaTime;
        const accelerationY = Math.sin(this.rotation) * this.acceleration * deltaTime;

        this.velocityX += accelerationX;
        this.velocityY += accelerationY;

        const speed = Math.hypot(this.velocityX, this.velocityY);
        if (speed > this.maxSpeed) {
            const scalingFactor = this.maxSpeed / speed;
            this.velocityX *= scalingFactor;
            this.velocityY *= scalingFactor;
        }

    }

    decelerate(deltaTime) {
        const decelerationX = -Math.cos(this.rotation) * this.acceleration * deltaTime;
        const decelerationY = -Math.sin(this.rotation) * this.acceleration * deltaTime;

        this.velocityX += decelerationX;
        this.velocityY += decelerationY;

        const speed = Math.hypot(this.velocityX, this.velocityY);
        if (speed > this.maxSpeed) {
            const scalingFactor = this.maxSpeed / speed;
            this.velocityX *= scalingFactor;
            this.velocityY *= scalingFactor;
        }

    }

    applyFriction(deltaTime) {
        const speed = Math.hypot(this.velocityX, this.velocityY);
        if (speed > 0) {
            const decelerationAmount = this.deceleration * deltaTime;
            const newSpeed = Math.max(0, speed - decelerationAmount);
            const scalingFactor = newSpeed / speed;
            this.velocityX *= scalingFactor;
            this.velocityY *= scalingFactor;
        }
    }

    shoot() {

    }

    getDistanceTo(object) {
        const offset = this.camera.width / 2 > this.mapBorders.width / 2 ? this.mapBorders.width / 2 : this.camera.width / 2;

        const middleX1 = this.x + (this.width / 2);
        const middleY1 = this.y + (this.height / 2);

        const middleX2 = object.x - offset + (object.width / 2);
        const middleY2 = object.y + (object.height / 2);

        const deltaX = middleX2 - middleX1;
        const deltaY = middleY2 - middleY1;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    handleMouseDown(mouse) {
        const offset = this.camera.width / 2 > this.mapBorders.width / 2 ? this.mapBorders.width / 2 : this.camera.width / 2;
        const x = mouse.x - offset;
        const y = mouse.y - this.camera.height / 2 - 75;

        if (!(Math.abs(x) <= this.maxPartDistance && Math.abs(y) <= this.maxPartDistance)) {
            console.log('too big');
            return;
        }

        const part = new Part(this, x, y, 5, 5, 'yellow', {
            type: Resource.HEALTH,
            cost: 1,
            usage: 'second',
            interval: 1,
            currentInterval: 0,
        }, 'test')

        part.x = -x - 2;
        part.y = -y - 2;

        this.weapons.push(part)
    }


    setCamera(width, height) {
        this.camera.width = width;
        this.camera.height = height;

        this.preparePlayerInterface();
    }

    preparePlayerInterface() {
        this.healthBar = new UIProgressBar(0.25, 0.95, 0.5, 0.02, '#FF4C4C');
        this.shieldBar = new UIProgressBar(0.25, 0.92, 0.5, 0.02, '#FFFFFF');

        eventHandler.dispatchEvent(EventType.UI_ELEMENT_CREATE, this.healthBar);
        eventHandler.dispatchEvent(EventType.UI_ELEMENT_CREATE, this.shieldBar);
    }

    dispatchRotation() {
        eventHandler.dispatchEvent(EventType.PLAYER_ROTATE, {rotation: this.rotation})
    }

    onClick() {
        super.onClick();
    }

    checkClick(mouse) {
        const subElementsClicked =
            this.weaponSlots.find(object => {
                return (
                    mouse.x >= object.x &&
                    mouse.x <= object.x + object.width &&
                    mouse.y >= object.y &&
                    mouse.y <= object.y + object.height
                );
            })
        ;

        if (subElementsClicked) {
            subElementsClicked.onClick();
            return true;
        }

        return false;
    }

    changePosition(x, y) {
        this.x = Math.round((x - this.width / 2))
        this.y = Math.round((y - this.height / 2));


    }

    onMouseUp() {
    }

    onRender(graphicEngine) {
        eventHandler.dispatchEvent(EventType.PLAYER_RENDER, {object: this, graphicEngine: graphicEngine})
    }

    renderOnMinimap(minimap, graphicEngine) {
        const playerWidth = Math.max(3, this.width * minimap.scale);
        const playerHeight = Math.max(3, this.height * minimap.scale);

        graphicEngine.ctx.save();

        graphicEngine.ctx.translate(
            this.x * minimap.scale + minimap.x + playerWidth / 2,
            this.y * minimap.scale + minimap.y + playerHeight / 2
        );

        graphicEngine.ctx.rotate(this.rotation);

        graphicEngine.drawSquare(
            -playerWidth / 2,
            -playerHeight / 2,
            playerWidth,
            playerHeight,
            'cyan'
        );

        graphicEngine.ctx.restore();
    }

    render(graphicEngine) {
        this.thrustEmitter.render(graphicEngine);

        graphicEngine.rotate(this, this.rotation);
        graphicEngine.ctx.rotate(Math.PI / 2);
        this.drawShip(graphicEngine);

        this.weapons.forEach(part => {
            part.render(graphicEngine);
        });

        graphicEngine.restore();

        this.weapons.forEach(part => {
            part.renderAfterTransform(graphicEngine);
        });
    }

    renderUi(graphicEngine) {

    }

    drawShip(graphicEngine) {
        graphicEngine.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height,);
    }

    /**
     * Update the player's state.
     * @param {number} deltaTime - The time elapsed since the last update (in seconds).
     */
    update(deltaTime) {
        eventHandler.dispatchEvent(EventType.PLAYER_UPDATE, { object: this });

        this.thrustEmitter.update(deltaTime, this);

        const deltaX = this.velocityX * deltaTime;
        const deltaY = this.velocityY * deltaTime;
        this.moveBy(deltaX, deltaY);

        this.weapons.forEach(part => {
            part.update(deltaTime);
        });

        this.applyFriction(deltaTime);

        this.healthBar.update(this.resources.health.amount(), this.resources.health.max(), 0);
        this.shieldBar.update(this.resources.shield.amount(), this.resources.shield.max(), 0);

    }

    rotate(angleDelta) {
        const originalRotation = this.rotation;
        this.rotation += angleDelta;

        if (this.rotation >= 2 * Math.PI) {
            this.rotation -= 2 * Math.PI;
        } else if (this.rotation < 0) {
            this.rotation += 2 * Math.PI;
        }

        const vertices = this.getVertices(true);
        const isWithinBounds = vertices.every(
            vertex =>
                vertex.x >= 0 &&
                vertex.x <= this.mapBorders.width &&
                vertex.y >= 0 &&
                vertex.y <= this.mapBorders.height
        );

        if (!isWithinBounds) {
            this.rotation = originalRotation;
        }

        this.dispatchRotation();
    }

    moveBy(deltaX, deltaY) {
        const newX = this.x + deltaX;
        const newY = this.y + deltaY;

        const originalX = this.x;
        const originalY = this.y;

        this.x = newX;
        this.y = newY;

        const vertices = this.getVertices(true);
        const isWithinBounds = vertices.every(
            vertex =>
                vertex.x >= 0 &&
                vertex.x <= this.mapBorders.width &&
                vertex.y >= 0 &&
                vertex.y <= this.mapBorders.height
        );

        if (!isWithinBounds) {
            this.x = originalX;
            this.y = originalY;
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }

    activateSlot(number) {
        const weaponSlots = this.gameEngine.interfaceElements.filter(element => element.type === InterfaceType.WEAPON_SLOT);

        weaponSlots[number].trigger(this);
    }

    setMapBorders(width, height) {
        this.mapBorders = {
            width: width,
            height: height
        }
    }

    checkCollision(obj) {
        if (!obj.collisionObjects || !obj.collisionObjects.includes(this.type) && !this.collisionObjects.includes(obj.type)) {
            return false;
        }

        const thisVertices = this.getVertices();
        const otherVertices = obj.getVertices();

        return this.checkSAT(thisVertices, otherVertices);
    }

    onCollision(object) {
        if(object.type === EntityTypes.COLLECTIBLE) {
            console.log('collected');
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, object);
        }
        if (object.type === EntityTypes.ENEMY) {
            this.dealDamage(object.damage);

            object.onCollision(this);
        }
        if (object.type === EntityTypes.PROJECTILE_ENEMY) {
            this.dealDamage(object.damage);
        }
    }

    dealDamage(damage) {
        if (this.resources.shield.amount() <= 0) {
            this.resources.health.removeAmount(damage);
        } else {
            this.resources.shield.removeAmount(damage);
        }

        if (this.resources.health.amount() <= 0) {
            eventHandler.dispatchEvent(EventType.PLAYER_DESTROYED, this)
        }
    }


    checkPartVertices(otherVertices) {
        for (let x = 0; x < this.weapons.length; x++) {
            if (this.checkSAT(this.weapons[x].getVertices(), otherVertices) === true) {
                return true;
            }
        }

        return false;
    }

    getVertices(parts = false) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        let cos = Math.cos(this.rotation - Math.PI / 2);
        let sin = Math.sin(this.rotation - Math.PI / 2);

        let vertices = [
            { x: this.x + halfWidth + (-halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (-halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth + (halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth + (halfWidth * cos - halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + halfHeight * cos) },
            { x: this.x + halfWidth + (-halfWidth * cos - halfHeight * sin), y: this.y + halfHeight + (-halfWidth * sin + halfHeight * cos) },
        ];

        if (parts) {
            this.weapons.forEach(part => {
                const partVertices = part.getVertices();

                partVertices.forEach(partVertice => {
                    vertices.push(partVertice);
                })
            });
        }


        return vertices;
    }

    checkSAT(thisVertices, otherVertices) {
        const axes = [
            ...this.getAxes(thisVertices),
            ...this.getAxes(otherVertices)
        ];

        for (const axis of axes) {
            const [minA, maxA] = this.projectOntoAxis(thisVertices, axis);
            const [minB, maxB] = this.projectOntoAxis(otherVertices, axis);

            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
        return true;
    }

    projectOntoAxis(vertices, axis) {
        let min = Infinity;
        let max = -Infinity;

        for (const vertex of vertices) {
            const projection = (vertex.x * axis.x + vertex.y * axis.y);
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        }

        return [min, max];
    }

    getAxes(vertices) {
        const axes = [];
        for (let i = 0; i < vertices.length; i++) {
            const nextIndex = (i + 1) % vertices.length;
            const edge = {
                x: vertices[nextIndex].x - vertices[i].x,
                y: vertices[nextIndex].y - vertices[i].y
            };

            axes.push({ x: -edge.y, y: edge.x });
        }
        return axes;
    }
}