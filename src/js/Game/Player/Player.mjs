import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {Part} from "./Part.mjs";
import {Bar} from "../Interface/Element/Bar.mjs";
import {WeaponSlot} from "../Interface/Element/WeaponSlot.mjs";
import {InterfaceType} from "../Interface/InterfaceType.mjs";
import {Resource} from "./Resource.mjs";
import {Projectile} from "./Projectile.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";

export class Player extends GameObject {

    constructor(x,y, w, h) {
        super(x, y, w, h);

        this.rotation = -Math.PI / 2;
        this.clicked = false;
        this.rotationSpeed = 2.5;
        this.speed = 6;

        this.maxPartDistance = 100;
        this.parts = [
            Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade')),
            Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade 2')),
            Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade 3')),
            Part.fromJSON(this, loader.getResource('parts', 'Shield Upgrade 4')),
            // Part.fromJSON(this, loader.getResource('parts', 'Engine 2')),
            // Part.fromJSON(this, loader.getResource('parts', 'Fuel Tank')),
            // new Part(this, 30, -100, 10, 10),
            // new Part(this, 30, 30, 10, 10),
            // new Part(this, -30, -100, 10, 10),
            // new Part(this,  -30, 30, 10, 10),
        ];


        this.resources = {
            shield: new Resource(Resource.ENERGY, 100, 50),
            health: new Resource(Resource.HEALTH, 100, 33)
        }

        this.currentPart = null;

        this.weaponSlots = [];

        this.collisionObjects = [
            EntityTypes.ENEMY
        ]

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

        eventHandler.addKeyHandler(37, () => {
            this.rotate(-this.rotationSpeed);
        }, false)

        eventHandler.addKeyHandler(39, () => {
            this.rotate(this.rotationSpeed)
        })

        eventHandler.addKeyHandler(32, () => {
            this.shot();
        });

        eventHandler.addKeyHandler(38, () => {
            this.moveForward()
        });

        eventHandler.addKeyHandler(40, () => {
            this.moveBackward()
        });

        const keyCodes = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48];

        keyCodes.forEach((keyCode, index) => {
            eventHandler.addKeyHandler(keyCode, () => {
                this.activateSlot(index);
            }, true);
        });

        eventHandler.dispatchEvent(EventType.PLAYER_CREATE, {object: this})
    }

    shot() {
        // const halfWidth = this.width / 2;
        // const halfHeight = this.height / 2;
        // let cos = Math.cos(this.rotation - Math.PI / 2);
        // let sin = Math.sin(this.rotation - Math.PI / 2);
        //
        // const pos = {
        //     x: this.x + halfWidth + (cos - halfHeight * 1.1 * sin),
        //     y: this.y + halfHeight + (sin + halfHeight * 1.1 * cos)
        // }
        // const projectile = new Projectile(pos.x , pos.y, Math.cos(this.rotation), Math.sin(this.rotation), EntityTypes.PROJECTILE_PLAYER);
        //
        // projectile.collisionObjects = [
        //     EntityTypes.ENEMY
        // ]
        //
        // projectile.damage = 200;

        // eventHandler.dispatchEvent(EventType.OBJECT_CREATED, projectile);
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

        this.parts.push(part)
    }


    setCamera(width, height) {
        this.camera.width = width;
        this.camera.height = height;

        this.preparePlayerInterface();
    }

    preparePlayerInterface() {
        const boxWidth = 50;
        const boxHeight = 50;
        const spacing = 10;
        const numBoxes = 10;

        const totalWidth = numBoxes * boxWidth + (numBoxes - 1) * spacing;

        const startX = (this.camera.width - totalWidth) / 2;

        this.posX = startX;
        let x = 0;
        let y = this.camera.height - boxHeight - 20;

        for (let i = 0; i < numBoxes; i++) {
            x = startX + i * (boxWidth + spacing);

            const weaponSlot = new WeaponSlot(x, y, boxWidth, boxHeight);

            this.weaponSlots.push(weaponSlot);
        }
        const width = x - startX + boxWidth;

        y -= 20;
        this.healthBar = new Bar(startX, y, width, 10, '#FF4C4C');
        this.shieldBar = new Bar(startX, y - 14, width, 10, '#FFFFFF');
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
        graphicEngine.rotate(this, this.rotation)

        graphicEngine.ctx.rotate(-Math.PI / 2);
        this.drawShip(graphicEngine);

        this.parts.forEach(part => {
            part.render(graphicEngine);
        });

        graphicEngine.restore()

        this.parts.forEach(part => {
            part.renderAfterTransform(graphicEngine);
        });

    }

    renderUi(graphicEngine) {
        this.weaponSlots.forEach(weaponSlot => {
            weaponSlot.render(graphicEngine);
        });

        this.healthBar.render(graphicEngine);
        this.shieldBar.render(graphicEngine);
    }

    drawShip(graphicEngine) {
        graphicEngine.drawSquare(-this.width / 2, -this.height / 2, this.width, this.height, this.color);
    }

    update() {
        eventHandler.dispatchEvent(EventType.PLAYER_UPDATE, {object: this});

        this.parts.forEach(part => {
            part.update();
        })

        this.healthBar.update(this.resources.health.amount(), this.resources.health.max(), 0);
        this.shieldBar.update(this.resources.shield.amount(), this.resources.shield.max(), 0);
    }

    moveBackward() {
        const newX = this.x - Math.cos(this.rotation) * this.speed;
        const newY = this.y - Math.sin(this.rotation) * this.speed;

        const originalX = this.x;
        const originalY = this.y;
        this.x = newX;
        this.y = newY;

        const vertices = this.getVertices(true);

        const isWithinBounds = vertices.every(vertex =>
            vertex.x >= 0 && vertex.x <= this.mapBorders.width &&
            vertex.y >= 0 && vertex.y <= this.mapBorders.height
        );

        if (isWithinBounds) {
            this.x = newX;
            this.y = newY;
        } else {
            this.x = originalX;
            this.y = originalY;
        }

        return this;
    }

    moveForward() {
        const newX = this.x + Math.cos(this.rotation) * this.speed;
        const newY = this.y + Math.sin(this.rotation) * this.speed;

        const originalX = this.x;
        const originalY = this.y;
        this.x = newX;
        this.y = newY;

        const vertices = this.getVertices(true);

        const isWithinBoundsX = vertices.every(vertex =>
            vertex.x >= 0 && vertex.x <= this.mapBorders.width
        );

        const isWithinBoundsY = vertices.every(vertex =>
            vertex.y >= 0 && vertex.y <= this.mapBorders.height
        );

        if (isWithinBoundsX && isWithinBoundsY) {
            this.x = newX;
            this.y = newY;
        } else {
            this.x = originalX;
            this.y = originalY;


            if (!isWithinBoundsX && !isWithinBoundsY) {
                return this;
            }

            if (!isWithinBoundsX) {
                const slideY = this.y + Math.sin(this.rotation) * this.speed;
                this.y = (slideY >= 0 && slideY <= this.mapBorders.height) ? slideY : this.y;
            }

            if (!isWithinBoundsY) {
                const slideX = this.x + Math.cos(this.rotation) * this.speed;
                this.x = (slideX >= 0 && slideX <= this.mapBorders.width) ? slideX : this.x;
            }
        }

        return this;
    }

    rotate(angle) {
        const originalRotation = this.rotation;
        this.rotation += angle * (Math.PI / 180);
        if (this.rotation >= 2 * Math.PI) {
            this.rotation -= 2 * Math.PI;
        }

        const vertices = this.getVertices(true);

        const isWithinBounds = vertices.every(vertex =>
            vertex.x >= 0 && vertex.x <= this.mapBorders.width &&
            vertex.y >= 0 && vertex.y <= this.mapBorders.height
        );

        if (!isWithinBounds) {
            this.rotation = originalRotation;
        }

        this.dispatchRotation();

        return this;
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

        this.resources.health.removeAmount(object.damage);
        // eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, object)
    }

    checkPartVertices(otherVertices) {
        for (let x = 0; x < this.parts.length; x++) {
            if (this.checkSAT(this.parts[x].getVertices(), otherVertices) === true) {
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
            this.parts.forEach(part => {
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