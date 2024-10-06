import {GameObject} from "../Object/GameObject.mjs";
import {EventHandler} from "../../Event/EventHandler.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {EntityTypes} from "../Object/EntityTypes.mjs";

export class Projectile extends GameObject {
    constructor(x, y, direction) {
        super(x, y,5 , 5);

        this.direction = direction;
        this.x = x;
        this.y = y;
        this.speed = 20;
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
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }
}