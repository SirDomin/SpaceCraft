import {WeaponSlot} from "../Game/Interface/Element/WeaponSlot.mjs";
import {EventHandler} from "../Event/EventHandler.mjs";
import {EventType} from "../Event/EventType.mjs";
import {InterfaceType} from "../Game/Interface/InterfaceType.mjs";
import {UIButton} from "../Game/Interface/Element/UIButton.mjs";

export class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine
        this.elements = [];
        this.graphicEngine = gameEngine.graphicEngine;
    }

    addElement(element) {
        this.elements.push(element);
    }

    handleMouseDown(mouse) {
        this.elements.forEach(element => {
            if (element.checkClick(mouse.x, mouse.y)) {
                element.onClick();
            }
        });
    }

    render() {
        this.elements.forEach(element => {
            element.render(this.graphicEngine);
        });
    }

    update(deltaTime) {
        this.elements.forEach(element => {
            if (element.update) {
                element.update(deltaTime);
            }
        });
    }

    generateUI() {
        const startButton = new UIButton(50, 50, 150, 50, "Start Game", () => {
            console.log("Game Started!");
        });
        this.addElement(startButton);

    }
}