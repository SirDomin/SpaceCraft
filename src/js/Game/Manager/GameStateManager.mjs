import {EventType} from "../../Event/EventType.mjs";
import {GameState} from "../GameState.mjs";
import {Player} from "../Player/Player.mjs";
import {ScrollableView} from "../Interface/Element/ScrollableView.mjs";
import {Box} from "../Interface/Element/Box.mjs";
import {UIButton} from "../Interface/Element/UIButton.mjs";
import {GameViewState} from "../GameViewState.mjs";
import {UIText} from "../Interface/Element/UIText.mjs";

export class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        this.previousState = null;
        this.previousViewState = GameViewState.DEFAULT;

        this.gameViewElements = {};

        this.lastStateChanged = null;

        eventHandler.addEventHandler(EventType.GAME_STATE_CHANGE, data => {
            eventHandler.dispatchEvent(EventType.GAME_VIEW_CHANGED, {from: this.previousState, to: data.state})
            this.previousState = this.gameEngine.state;
            this.stateChanged(this.gameEngine.state, data.state);
            this.gameEngine.state = data.state;

            this.lastStateChanged = 'view';
        })

        eventHandler.addEventHandler(EventType.GAME_VIEW_CHANGE, data => {
            eventHandler.dispatchEvent(EventType.GAME_VIEW_CHANGED, {from: this.previousViewState, to: data.state});
            this.previousViewState = this.gameEngine.gameState || GameViewState.DEFAULT;

            this.gameViewChange(this.previousState, data.state);
            this.gameEngine.gameState = data.state;
            this.lastStateChanged = 'game';
        })

        eventHandler.addEventHandler(EventType.PREVIOUS_STATE, (e) => {
            return;
            this.handlePreviousState();
        })
    }

    handlePreviousState() {

        if (this.lastStateChanged === null) {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {});
        } else if (this.lastStateChanged === 'game') {

        } else if (this.lastStateChanged === 'view') {
            eventHandler.dispatchEvent(EventType.GAME_VIEW_CHANGE, {state: this.previousViewState});
        }
    }

    stateChanged(previousState, state) {
        switch (state) {
            case GameState.MENU:
                this.renderMainMenu();
                break;
            case GameState.GAME:
                this.renderGame();
                break;
            case GameState.PAUSE:
                this.displayGameMenu();
                break;
        }

    }

    gameViewChange(previous, state) {
        switch (previous) {
            case GameViewState.MENU:
                    this.removeGameMenu(previous, state);
                break;
            case GameViewState.SHOP:
                    this.removeShopMenu(previous, state);
                break;
        }
        switch (state) {
            case GameViewState.MENU:
                    this.displayGameMenu();
                break;
            case GameViewState.SHOP:
                    this.displayGameShop();
                break;
            case GameViewState.DEFAULT:

                break;
        }
    }

    renderGame() {
        this.gameEngine.uiManager.generateUI();

        this.gameEngine.game();
    }

    displayGameMenu() {
        const box = new Box(0.31, 0.14, 0.38, 0.72)
        box.color = 'rgba(0,0,0,0.11)';
        box.index = 22;

        const box2 = new Box(0, 0, 1, 1)
        box2.color = 'rgba(0,0,0, 0.1)';
        box2.index = 20;

        const startGameButton = new UIButton(0.42, 0.26, 0.16, 0.08, "RESUME", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {});

        }).setIndex(23);

        const optionsGameButton = new UIButton(0.42, 0.37, 0.16, 0.08, "OPTIONS", () => {
            eventHandler.dispatchEvent(EventType.GAME_VIEW_CHANGE, {state: GameViewState.OPTIONS})
        }).setIndex(23);

        const exitGameButton = new UIButton(0.42, 0.48, 0.16, 0.08, "EXIT", () => {
            eventHandler.dispatchEvent(EventType.EXIT_GAME, {})
        }).setIndex(23);

        this.addElement(startGameButton);
        this.addElement(optionsGameButton);
        this.addElement(exitGameButton);
        this.addElement(box)
        this.addElement(box2)
    }

    displayGameShop() {
        const box = new Box(0, 0.09, 1, 0.72)
        box.color = 'rgba(0,0,0,0.11)';
        box.index = 22;

        const box2 = new Box(0, 0, 1, 1)
        box2.color = 'rgba(0,0,0, 0.1)';
        box2.index = 20;

        const shopText = new UIText(0.47, 0.09, 'SHOP', '40px', 'white').setIndex(25).setTextAlign('left');

        const itemBox = new Box(0.01, 0.16, 0.52, 0.36)
        itemBox.index = 23;

        this.addElement(box);
        this.addElement(box2);
        this.addElement(itemBox);
        this.addElement(shopText);
    }

    removeGameMenu() {
        this.gameViewElements[GameViewState.MENU].forEach(elementId => {
            eventHandler.dispatchEvent(EventType.UI_ELEMENT_REMOVE, elementId);
        })
    }
    removeShopMenu() {
        this.gameViewElements[GameViewState.SHOP].forEach(elementId => {
            eventHandler.dispatchEvent(EventType.UI_ELEMENT_REMOVE, elementId);
        })
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
        if (!this.gameViewElements[this.gameEngine.gameState]) {
            this.gameViewElements[this.gameEngine.gameState] = [];
        }

        this.gameViewElements[this.gameEngine.gameState].push(element.id);

        eventHandler.dispatchEvent(EventType.UI_ELEMENT_CREATE, element);
    }

}