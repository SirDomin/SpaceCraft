import {GraphicEngine} from "./Engine/GraphicEngine.mjs";
import {GameEngine} from "./Engine/GameEngine.mjs";
import {Player} from "./Game/Player/Player.mjs";
import {EventHandler} from "./Event/EventHandler.mjs";
import {EventType} from "./Event/EventType.mjs";
import {ResourceLoader} from "./Loader/ResourceLoader.mjs";
import {Enemy} from "./Game/Object/Enemy.mjs";

window.gameScale = 1.3;
window.eventHandler = new EventHandler();
window.debug = false;
window.renderCollisions = true;
window.cameraPos = {};

const graphicEngine = new GraphicEngine(document.body);

window.gameEngine = new GameEngine(graphicEngine);

window.loader = new ResourceLoader();

window.loader.loadAllResources().then(() => {
    const player = new Player(5, 10, 20, 20);

    gameEngine.addPlayer(player);

    gameEngine.start();

    eventHandler.addEventHandler(EventType.GAME_TICK, e => {
        eventHandler.tick();
    }, 'game-tick').debug = false

    eventHandler.addMouseHandler('mousedown', (mouse) => {
        player.handleMouseDown(mouse);
        return gameEngine.handleMouseDown(mouse);
    }, 'engine-keydown', true).setPriority(0);

    generateEnemiesInCircle(player, 50, 400);
});

function generateEnemiesInCircle(player, x, r) {
    const enemies = [];
    const angleStep = (2 * Math.PI) / x;

    for (let i = 0; i < x; i++) {
        const angle = i * angleStep;
        const enemyX = player.x + r * Math.cos(angle);
        const enemyY = player.y + r * Math.sin(angle);

        const enemy = new Enemy(enemyX, enemyY, 20, 20);
        // enemy.setTarget(player)
        enemies.push(enemy);

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, enemy);
    }

    return enemies;
}


