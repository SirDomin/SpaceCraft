import {GameObject} from "./GameObject.mjs";
import {EntityTypes} from "./EntityTypes.mjs";

export class Enemy extends GameObject {
    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.type = EntityTypes.ENEMY;
        this.speed = 10;
    }

    setTarget(target) {
        this.target = target;
    }

    attackTarget() {

    }

}