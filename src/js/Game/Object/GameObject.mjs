import { EntityTypes } from "./EntityTypes.mjs";
import { Utils } from "../../Utils/Utils.mjs";

export class GameObject {
    x;
    y;
    width;
    height;
    removeOnOutOfBound;
    type;
    collisionType;
    collisionChecks;
    id;
    color;
    speed;
    target;
    renderPriority;

    static COLLISION_TYPE_BOX = 1;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.removeOnOutOfBound = false;
        this.type = EntityTypes.TYPE_DEFAULT_OBJECT;
        this.collisionType = GameObject.COLLISION_TYPE_BOX;
        this.collisionChecks = 0;
        this.id = Utils.generateId();
        this.color = 'darkblue';
        this.speed = 20 * (Math.random() + 0.1);
        this.target = null;
        this.serverTick = false;
        this.renderPriority = 1;
        this.rotation = 0;
        this.collisionObjects = [];
        this.damage = 0;
        this.alwaysVisible = false;
        this.collisionPriority = 0;
    }

    /**
     * Update the game object's state.
     * @param {number} deltaTime - The time elapsed since the last update (in seconds).
     */
    update(deltaTime) {
        if (this.target) {
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;
            const thisCenterX = this.x + this.width / 2;
            const thisCenterY = this.y + this.height / 2;

            const deltaX = targetCenterX - thisCenterX;
            const deltaY = targetCenterY - thisCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const dirX = deltaX / distance;
            const dirY = deltaY / distance;

            this.x += dirX * this.speed * deltaTime;
            this.y += dirY * this.speed * deltaTime;
        }
    }

    onRender(graphicEngine) {
    }

    getDistanceTo(object) {
        const middleX1 = this.x + this.width / 2;
        const middleY1 = this.y + this.height / 2;

        const middleX2 = object.x + object.width / 2;
        const middleY2 = object.y + object.height / 2;

        const deltaX = middleX2 - middleX1;
        const deltaY = middleY2 - middleY1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    renderOnMinimap(minimap, graphicEngine) {
        graphicEngine.drawSquare(
            this.x * minimap.scale + minimap.x,
            this.y * minimap.scale + minimap.y,
            this.width * minimap.scale,
            this.height * minimap.scale,
            this.color
        );
    }

    onClick() {
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    collide(object) {
    }

    getVertices() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const cos = Math.cos(this.rotation - Math.PI / 2);
        const sin = Math.sin(this.rotation - Math.PI / 2);

        return [
            {
                x: this.x + halfWidth + (-halfWidth * cos - -halfHeight * sin),
                y: this.y + halfHeight + (-halfWidth * sin + -halfHeight * cos),
            },
            {
                x: this.x + halfWidth + (halfWidth * cos - -halfHeight * sin),
                y: this.y + halfHeight + (halfWidth * sin + -halfHeight * cos),
            },
            {
                x: this.x + halfWidth + (halfWidth * cos - halfHeight * sin),
                y: this.y + halfHeight + (halfWidth * sin + halfHeight * cos),
            },
            {
                x: this.x + halfWidth + (-halfWidth * cos - halfHeight * sin),
                y: this.y + halfHeight + (-halfWidth * sin + halfHeight * cos),
            },
        ];
    }

    onCollision(object) {
    }

    checkCollision(object) {
        const thisVertices = this.getVertices();
        const otherVertices = object.getVertices();

        return this.checkSAT(thisVertices, otherVertices);
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
