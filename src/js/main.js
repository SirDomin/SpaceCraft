import {GraphicEngine} from "./Engine/GraphicEngine.mjs";
import {GameEngine} from "./Engine/GameEngine.mjs";
import {Player} from "./Game/Player/Player.mjs";
import {EventHandler} from "./Event/EventHandler.mjs";
import {EventType} from "./Event/EventType.mjs";
import {ResourceLoader} from "./Loader/ResourceLoader.mjs";
import {Enemy} from "./Game/Object/Enemy.mjs";
import {Hitmark} from "./Game/Object/Hitmark.mjs";
import {ModifiedAudio} from "./Game/Audio/ModifiedAudio.mjs";
import {Utils} from "./Utils/Utils.mjs";
import {EnemyFactory} from "./Game/Factory/EnemyFactory.mjs";
import {GameState} from "./Game/GameState.mjs";

window.gameScale = 1.3;
window.eventHandler = new EventHandler();
window.debug = false;
window.renderCollisions = false;
window.cameraPos = {};
window.edit = false;

let userInteracted = false;

const graphicEngine = new GraphicEngine(document.body);

window.gameEngine = new GameEngine(graphicEngine);

window.loader = new ResourceLoader();

window.loader.loadAllResources().then(() => {
    gameEngine.start();

    eventHandler.dispatchEvent(EventType.GAME_STATE_CHANGE, {state: GameState.GAME});

    eventHandler.addEventHandler(EventType.GAME_TICK, e => {
        // eventHandler.tick();
    }, 'game-tick').debug = false

    eventHandler.addMouseHandler('mousedown', (mouse) => {
        // player.handleMouseDown(mouse);
        return gameEngine.handleMouseDown(mouse);
    }, 'engine-keydown', true).setPriority(0);

    eventHandler.addMouseHandler('mousemove', (mouse) => {
        return gameEngine.handleMouseHover(mouse);
    }).debug = false

    eventHandler.addMouseHandler('mouseup', (mouse) => {
        return gameEngine.handleMouseUp(mouse);
    }).debug = false

    const hm = loader.getMediaFile('hitmark');

    const hitSounds = [
        loader.getAudio('hit'),
        loader.getAudio('hit1'),
        loader.getAudio('hit2'),
        loader.getAudio('hit3'),
    ]

    eventHandler.addEventHandler(EventType.PROJECTILE_HIT, e => {

        // const audio = new Audio(Utils.getRandomElement(hitSounds).src);
        // audio.volume = Utils.random(20, 40) / 100
        // audio.play();
        const hitmark = new Hitmark(e.x, e.y, 20, 20, 10, 4, 0.2);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);
    })

    document.addEventListener('visibilitychange', () => {
        eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE);
    })

    // generateEnemiesInCircle(player, 50, 800);
    // generateEnemiesInCircle(player, 50, 1200);
    // generateEnemiesInCircle(player, 50, 1600);
    // generateEnemiesInCircle(player, 50, 2000);
});

// eventHandler.addEventHandler('test', () => {
//     generateEnemiesInCircle(gameEngine.player,30, 500)
// })

function generateEnemiesInCircle(player, x, r) {
    const enemies = [];
    const angleStep = (2 * Math.PI) / x;

    for (let i = 0; i < x; i++) {
        const angle = i * angleStep;
        const enemyX = player.x + r * Math.cos(angle);
        const enemyY = player.y + r * Math.sin(angle);

        // const enemy = EnemyFactory.createEnemy('burst_shooter');
        const enemy = EnemyFactory.createRandomEnemy();

        enemy.setPosition(enemyX, enemyY)
        // enemy.enableReplication();
        enemy.setTarget(player)

        enemies.push(enemy);

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, enemy);
    }

    EnemyFactory.createRandomEnemy();

    return enemies;
}

function generateXEnemiesInFront(numEnemies, player) {
    for (let i = 0; i < numEnemies; i++) {
        const enemyX = player.x;
        const enemyY = player.y - (20 * i)

        const enemy = new Enemy(enemyX, enemyY, 20, 20, 20000);
        // enemy.setTarget(player)

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, enemy);
    }
}
