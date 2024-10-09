import {GameObject} from "../Object/GameObject.mjs";
import {EventHandler} from "../../Event/EventHandler.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";

export class Projectile extends GameObject {
    constructor(x, y, speedX, speedY, type) {
        super(x, y,5 , 5);

        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.speed = 5;
        this.color = 'red';
        this.type = type;

        this.lifespan = 2000;
        this.creationTime = Date.now();
    }

    isExpired() {
        return (Date.now() - this.creationTime) > this.lifespan;
    }

    update() {
        if (this.isExpired()) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }
        this.x += this.speedX * this.speed;
        this.y += this.speedY * this.speed;
    }

    onCollision(object) {
        if (object.type === EntityTypes.ENEMY) {
            object.onCollision(this);
        }

        eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }
}