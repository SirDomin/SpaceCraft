import {EntityTypes} from "../Object/EntityTypes.mjs";
import {Utils} from "../../Utils/Utils.mjs";
import {InterfaceType} from "./InterfaceType.mjs";
import {GameObject} from "../Object/GameObject.mjs";

export class InterfaceObject {
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
    renderPriority;

    static COLLISION_TYPE_BOX = 1;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.removeOnOutOfBound = false;
        this.type = InterfaceType.INTERFACE_OBJECT;
        this.collisionType = GameObject.COLLISION_TYPE_BOX;
        this.collisionChecks = 0;
        this.id = Utils.generateId();
        this.color = 'darkblue';

        this.borderWidth = 1;
        this.borderColor = 'black';

        this.renderPriority = 1;
        this.rotation = 0;
    }

    update() {

    }

    onRender(graphicEngine) {

    }

    render(graphicEngine) {
        graphicEngine.drawSquare(
            this.x - this.borderWidth / 2,
            this.y - this.borderWidth / 2,
            this.width + this.borderWidth / 2,
            this.height + this.borderWidth / 2, this.borderColor
        );
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    onClick() {
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