import {WeaponSlot} from "../Game/Interface/Element/WeaponSlot.mjs";
import {EventHandler} from "../Event/EventHandler.mjs";
import {EventType} from "../Event/EventType.mjs";
import {InterfaceType} from "../Game/Interface/InterfaceType.mjs";

export class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.totalWidth = 0;
        this.posX = 0;
    }

    render(graphicEngine) {

    }

    generateUI() {
    }
}