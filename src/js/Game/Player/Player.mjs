import {GameObject} from "../Object/GameObject.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {Part} from "./Part.mjs";

export class Player extends GameObject {

    constructor(x,y, w, h) {
        super(x, y, w, h);

        this.rotation = -Math.PI / 2;
        this.clicked = false;
        this.rotationSpeed = 2.5;
        this.speed = 10;

        this.parts = [
            new Part(this, 20, 0, 10, 10),
        ];
        this.mapBorders = {
            width: 0,
            height: 0
        }

        this.color = 'yellow'

        eventHandler.dispatchEvent(EventType.PLAYER_CREATE, {object: this})

        eventHandler.addEventHandler(EventType.PLAYER_RENDER, (eventData) => {
            this.render(eventData.graphicEngine)
        }, 'player.render', false, 10).debug = false;

        eventHandler.addKeyHandler(37, () => {
            this.rotate(-this.rotationSpeed);
        }, false)

        eventHandler.addKeyHandler(39, () => {
            this.rotate(this.rotationSpeed)
        })

        eventHandler.addKeyHandler(38, () => {
            this.moveForward()
        });

        eventHandler.addKeyHandler(40, () => {
            this.moveBackward()
        })
    }

    dispatchRotation() {
        eventHandler.dispatchEvent(EventType.PLAYER_ROTATE, {rotation: this.rotation})
    }

    onClick() {
        super.onClick();

        eventHandler.addEventHandler(EventType.PLAYER_RENDER, (eventData) => {
            if (eventData.object === this) {
                eventData.graphicEngine.drawSquare(eventData.object.x - 2, eventData.object.y - 2, eventData.object.width + 4, eventData.object.height + 4, 'black')
            }
        }, 'player.renderBorder', true, 20).debug = false;

        eventHandler.addMouseHandler('mouseup', (mouse) => {
            eventHandler.removeMouseHandler('player.moveTo');
            eventHandler.removeHandler('player.renderBorder');
            eventHandler.removeMouseHandler('player.simulateMove');
        }, 'player.moveTo', true)

        eventHandler.addMouseHandler('mousemove', mouse => {
            this.changePosition(mouse.x, mouse.y);
        }, 'player.simulateMove', true).forObject(this).debug = false;
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
        window.collisionRendered = false;
        this.drawShip(graphicEngine);

        this.parts.forEach(part => {
            part.render(graphicEngine)
        });

        graphicEngine.restore()
    }

    drawShip(graphicEngine) {
        graphicEngine.drawSquare(-this.width / 2, -this.height / 2, this.width, this.height, 'blue');
    }

    update() {

    }

    moveBackward() {
        const newX = this.x - Math.cos(this.rotation) * this.speed;
        const newY = this.y - Math.sin(this.rotation) * this.speed;

        // Temporarily set the new position to calculate new vertices
        const originalX = this.x;
        const originalY = this.y;
        this.x = newX;
        this.y = newY;

        const vertices = this.getVertices();

        // Check if any vertex is out of bounds
        const isWithinBounds = vertices.every(vertex =>
            vertex.x >= 0 && vertex.x <= this.mapBorders.width &&
            vertex.y >= 0 && vertex.y <= this.mapBorders.height
        );

        // Restore original position if out of bounds
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

        const vertices = this.getVertices();

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

        const vertices = this.getVertices();

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

    setMapBorders(width, height) {
        this.mapBorders = {
            width: width,
            height: height
        }
    }

    checkCollision(obj) {
        const thisVertices = this.getVertices();
        const otherVertices = obj.getVertices();

        return this.checkSAT(thisVertices, otherVertices);
    }

    getVertices() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        let cos = Math.cos(this.rotation -Math.PI / 2);
        let sin = Math.sin(this.rotation - Math.PI / 2);

        let vertices = [
            { x: this.x + halfWidth + (-halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (-halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth + (halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth + (halfWidth * cos - halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + halfHeight * cos) },
            { x: this.x + halfWidth + (-halfWidth * cos - halfHeight * sin), y: this.y + halfHeight + (-halfWidth * sin + halfHeight * cos) },
        ];

        this.parts.forEach(part => {

            const partCos = Math.cos(this.rotation + part.relativeX + part.width / 2);
            const partSin = Math.sin(this.rotation + part.relativeY + part.height / 2);

            const partCenterX = this.x + (part.relativeX - part.width * partCos - part.relativeY * partSin);
            const partCenterY = this.y + (part.relativeX - part.height / 2 * partSin + part.relativeY * partCos);

            vertices.push({ x: partCenterX, y: partCenterY });
        });

        const cameraOffsetX = Math.max(0, Math.min(gameEngine.player.x + gameEngine.player.width / 2 - gameEngine.viewportWidth / 2, gameEngine.mapManager.map.width - gameEngine.viewportWidth));
        const cameraOffsetY = Math.max(0, Math.min(gameEngine.player.y + gameEngine.player.height / 2 - gameEngine.viewportHeight / 2, gameEngine.mapManager.map.height - gameEngine.viewportHeight));

        if (window.collisionRendered === false) {
            vertices.forEach(v => {
                gameEngine.graphicEngine.drawSquare(v.x - cameraOffsetX, v.y - cameraOffsetY, 5, 5, 'red')
            });

            window.collisionRendered = true;
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
            const projection = (vertex.x * axis.x + vertex.y * axis.y); // Dot product
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