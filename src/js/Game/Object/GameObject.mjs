import {EntityTypes} from "./EntityTypes.mjs";
import {Utils} from "../../Utils/Utils.mjs";

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
        this.speed = (20) * (Math.random() + 0.1);
        this.target = null;
        this.serverTick = false;
        this.renderPriority = 1;
        this.rotation = 0;
        this.collisionObjects = [];
        this.damage = 0;
        this.collisionPriority = 0;
    }

    update() {
        if (this.target) {
            this.x += -(this.speed) * Math.cos(Math.atan2(
                (this.target.y + this.target.height / 2) - (this.y + this.height / 2),
                (this.x + this.width / 2) - (this.target.x + this.target.width / 2)
            ));
            this.y += (this.speed) * Math.sin(Math.atan2(
                (this.target.y + this.target.height / 2) - (this.y + this.height / 2),
                (this.x + this.width / 2) - (this.target.x + this.target.width / 2)
            ));
        }

    }

    onRender(graphicEngine) {

    }

    getDistanceTo(object) {
        const middleX1 = this.x + (this.width / 2);
        const middleY1 = this.y + (this.height / 2);

        const middleX2 = object.x + (object.width / 2);
        const middleY2 = object.y + (object.height / 2);

        const deltaX = middleX2 - middleX1;
        const deltaY = middleY2 - middleY1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    renderOnMinimap(minimap, graphicEngine) {
        graphicEngine.drawSquare(this.x * minimap.scale + minimap.x, this.y * minimap.scale + minimap.y, this.width * minimap.scale, this.height * minimap.scale, this.color);
    }

    getMidPoint() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }

    onClick() {
        // this.color = 'yellow';
    }

    moveTo(x, y) {
        this.target = new Point(x, y);
    }

    collide(object) {
        game.removeObject(this.id);
    }

    getVertices() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const cos = Math.cos(this.rotation -Math.PI /2);
        const sin = Math.sin(this.rotation - Math.PI / 2);

        return [
            { x: this.x + halfWidth + (-halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (-halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth + (halfWidth * cos - -halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + -halfHeight * cos) },
            { x: this.x + halfWidth +(halfWidth * cos - halfHeight * sin), y: this.y + halfHeight + (halfWidth * sin + halfHeight * cos) },
            { x: this.x + halfWidth +(-halfWidth * cos - halfHeight * sin), y: this.y  + halfHeight+ (-halfWidth * sin + halfHeight * cos) },
        ];
    }

    onCollision(object) {
    }

    checkCollision(object) {
        this.collisionChecks++;
        if (object === this) {
            return false;
        }
        return (
            this.x + this.width >= object.x &&
            this.x <= object.x + object.width &&
            this.y + this.height >= object.y &&
            this.y <= object.y + object.height
        );
    }
}