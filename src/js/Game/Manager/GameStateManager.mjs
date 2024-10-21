import {EventType} from "../../Event/EventType.mjs";
import {GameState} from "../GameState.mjs";
import {Player} from "../Player/Player.mjs";
import {ScrollableView} from "../Interface/Element/ScrollableView.mjs";
import {Box} from "../Interface/Element/Box.mjs";
import {UIButton} from "../Interface/Element/UIButton.mjs";

export class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        this.previousState = null;

        eventHandler.addEventHandler(EventType.GAME_STATE_CHANGE, data => {
            this.stateChanged(this.gameEngine.state, data.state);
            this.gameEngine.state = data.state;
        })

        eventHandler.addEventHandler(EventType.GAME_VIEW_CHANGE, data => {
            this.gameViewChange(data.state);
        })
    }

    stateChanged(previousState, state) {
        switch (state) {
            case GameState.MENU:
                this.renderMainMenu();
                break;
            case GameState.GAME:
                this.renderGame();
                break;
        }
    }

    gameViewChange(state) {
        console.log(state);
    }

    renderGame() {
        this.gameEngine.uiManager.generateUI();

        this.gameEngine.game();
    }


    renderMainMenu() {
        const box = new Box(0, 0, 1, 1)
        box.color = 'black';

        const scrollableView = new ScrollableView(0, 0.5, 1, 0.1).setIndex(3);

        const startGameButton = new UIButton(0.26, 0.01, 0.1, 0.1, "Start", () => {

        }).setIndex(1);

        startGameButton.font = '5px Arial';

        const optionsGameButton = new UIButton(0.26, 0.05, 0.08, 0.02, "Options", () => {

        }).setIndex(1);


        const creditsGameButton = new UIButton(0.26, 0.09, 0.08, 0.02, "Credits", () => {

        }).setIndex(1);

        // this.addElement(startGameButton);
        // this.addElement(optionsGameButton);
        // this.addElement(creditsGameButton);
        // this.addElement(box)
        this.addElement(scrollableView)

        scrollableView.addChild(startGameButton);
        // scrollableView.addChild(optionsGameButton);
        // scrollableView.addChild(creditsGameButton);
    }

    addElement(element) {
        eventHandler.dispatchEvent(EventType.UI_ELEMENT_CREATE, element);
    }

}