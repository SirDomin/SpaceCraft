import {GraphicEngine} from "./Engine/GraphicEngine.mjs";
import {GameEngine} from "./Engine/GameEngine.mjs";
import {Player} from "./Game/Player/Player.mjs";
import {EventHandler} from "./Event/EventHandler.mjs";
import {EventType} from "./Event/EventType.mjs";

window.gameScale = 1.3;
window.eventHandler = new EventHandler();
window.debug = false;
window.renderCollisions = true;

const graphicEngine = new GraphicEngine(document.body);

window.gameEngine = new GameEngine(graphicEngine);

gameEngine.start();

const player = new Player(5, 10, 10, 50);

gameEngine.addPlayer(player);

eventHandler.addEventHandler(EventType.GAME_TICK, e => {
    eventHandler.tick();
}, 'game-tick').debug = false

eventHandler.addMouseHandler('mousedown', (mouse) => {
    return gameEngine.handleMouseDown(mouse);
}, 'engine-keydown', true).setPriority(0)


