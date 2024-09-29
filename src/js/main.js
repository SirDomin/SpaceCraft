import {GraphicEngine} from "./Engine/GraphicEngine.mjs";
import {GameEngine} from "./Engine/GameEngine.mjs";
import {Player} from "./Game/Player/Player.mjs";
import {EventHandler} from "./Event/EventHandler.mjs";
import {EventType} from "./Event/EventType.mjs";

window.gameScale = 1.3;
window.eventHandler = new EventHandler();
window.debug = false;

const graphicEngine = new GraphicEngine(document.body);

window.gameEngine = new GameEngine(graphicEngine);

gameEngine.start();


// eventHandler.addEventHandler(EventType.PLAYER_CREATE, e => {
//     const player = e.object;
//
//     player.changePosition(graphicEngine.canvas.width / 2, graphicEngine.canvas.height / 2)
// }, 'player-create')

const player = new Player(5, 10, 10, 100);


gameEngine.addPlayer(player);

eventHandler.addEventHandler(EventType.GAME_TICK, e => {
    eventHandler.tick();
}, 'game-tick').debug = false

// eventHandler.addMouseHandler('mousedown', (mouse) => {
//     // player.x = mouse.x;
//     // player.y = mouse.y;
//     const newPlayer = new Player(0, 0, 100, 100);
//     gameEngine.addGameObject(newPlayer);
//
//     newPlayer.changePosition(mouse.x, mouse.y);
// }, 'test', true).setPriority(10)


eventHandler.addMouseHandler('mousedown', (mouse) => {
    return gameEngine.handleMouseDown(mouse);
}, 'engine-keydown', true).setPriority(0)


