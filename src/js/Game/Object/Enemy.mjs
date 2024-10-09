import {GameObject} from "./GameObject.mjs";
import {EntityTypes} from "./EntityTypes.mjs";
import {Resource} from "../Player/Resource.mjs";
import {Bar} from "../Interface/Element/Bar.mjs";
import {EventType} from "../../Event/EventType.mjs";

export class Enemy extends GameObject {
    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.type = EntityTypes.ENEMY;
        this.baseSpeed = 3;

        this.speed = this.baseSpeed * (0.8 + Math.random() * 0.4);
        this.damage = 5;
        this.resistance = 5;

        this.resources = {
            health: new Resource(Resource.HEALTH, 500, 500),
        }

        this.healthBar = new Bar(this.x, this.y + this.height * 1.1, this.width, 5, '#FF4C4C').showValue(false);
    }

    setTarget(target) {
        this.target = target;
    }

    renderOnMinimap(minimap, graphicEngine) {
        const width = this.width * 2;
        const height = this.height * 2;
        graphicEngine.drawSquare(this.x * minimap.scale + minimap.x, this.y * minimap.scale + minimap.y, width * minimap.scale, height * minimap.scale, 'red');
    }

    update() {
        if (this.target) {
            const angleToTarget = Math.atan2(
                (this.target.y + this.target.height / 2) - (this.y + this.height / 2),
                (this.target.x + this.target.width / 2) - (this.x + this.width / 2)
            );

            const randomOffset = (Math.random() - 100) + 100;
            const modifiedAngle = angleToTarget + randomOffset;

            this.x += this.speed * Math.cos(modifiedAngle);
            this.y += this.speed * Math.sin(modifiedAngle);
        }

        this.healthBar.x = this.x;
        this.healthBar.y = this.y + this.height * 1.1;

        this.healthBar.update(this.resources.health.amount(), this.resources.health.max(), 0);


        if (this.resources.health.amount() <= 0) {
            eventHandler.dispatchEvent(EventType.ENEMY_DESTROYED, this);

            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }

    onCollision(object) {
        if (object.type === EntityTypes.PROJECTILE_PLAYER) {
            this.resources.health.removeAmount(object.damage);
        }
    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);

        this.healthBar.render(graphicEngine);
    }

    attackTarget() {

    }

}