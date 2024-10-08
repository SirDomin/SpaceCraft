import {GameObject} from "../Object/GameObject.mjs";
import {EventHandler} from "../../Event/EventHandler.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";

export class Projectile extends GameObject {
    constructor(x, y, speedX, speedY) {
        super(x, y,5 , 5);

        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.speed = 5;
        this.color = 'red';
        this.type = EntityTypes.PROJECTILE;

        this.lifespan = 500;
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

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }
}