import {EventType} from "../../Event/EventType.mjs";
import {GameState} from "../GameState.mjs";
import {Player} from "../Player/Player.mjs";

export class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        this.previousState = null;

        eventHandler.addEventHandler(EventType.GAME_STATE_CHANGE, data => {
            this.stateChanged(data.state);
        })

        eventHandler.addEventHandler(EventType.GAME_VIEW_CHANGE, data => {
            this.gameViewChange(data.state);
        })
    }

    stateChanged(state) {
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

    }

}