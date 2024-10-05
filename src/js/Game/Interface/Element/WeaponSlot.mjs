import {InterfaceObject} from "../InterfaceObject.mjs";
import {InterfaceType} from "../InterfaceType.mjs";

export class WeaponSlot extends InterfaceObject {

    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.borderWidth = 5;
        this.borderColor = 'rgba(255, 255, 255, 0.5)';
        this.activeBorderColor = 'rgba(128,232,20,0.74)';
        this.type = InterfaceType.WEAPON_SLOT;
        this.active = false;
        this.part = null;
    }

    onClick() {
        this.active = !this.active;
    }

    trigger(element) {
        this.active = !this.active;
    }

    render(graphicEngine) {
        graphicEngine.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        graphicEngine.ctx.fillRect(this.x, this.y, this.width, this.height);

        graphicEngine.ctx.strokeStyle = this.active === true ? this.activeBorderColor : this.borderColor;
        graphicEngine.ctx.lineWidth = this.borderWidth;
        graphicEngine.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.part) {
            this.part.update();
        }
    }


}