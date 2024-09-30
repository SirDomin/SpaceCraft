import {EventType} from "../Event/EventType.mjs";
import {GameObject} from "../Game/Object/GameObject.mjs";
import {MapManager} from "../Game/Map/MapManager.mjs";
import {Nebula} from "../Game/Object/Nebula.mjs";

export class GameEngine {
    graphicEngine;
    gameObjects;
    indexesToRemove;

    constructor(graphicEngine) {
        this.graphicEngine = graphicEngine;
        this.indexesToRemove = [];
        this.gameObjects = [];
        this.interfaceElements = [];
        this.player = null;

        this.viewportWidth = this.graphicEngine.canvas.width;
        this.viewportHeight = this.graphicEngine.canvas.height;
        this.mapManager = new MapManager().setPosition(graphicEngine.canvas.width, graphicEngine.canvas.height).setSize(100);

        this.lastTime = 0; // Time of the last frame
        this.frameCount = 0; // Number of frames counted
        this.fps = 0; // FPS value
        this.accumulatedTime = 0;

        eventHandler.addEventHandler(EventType.PLAYER_ROTATE, (data) => {
            this.updateCamera(data.rotation);
        }, 'player.rotation', false, 10)
    }

    generateRandomGameObjects(numObjects, objectWidth, objectHeight) {
        for (let i = 0; i < numObjects; i++) {
            const posx = Math.floor(Math.random() * (this.mapManager.map.width - objectWidth));
            const posy = Math.floor(Math.random() * (this.mapManager.map.height - objectHeight));

            const obj = new Nebula(posx, posy, objectWidth, objectHeight);
            obj.target = this.player

            this.gameObjects.push(obj);
        }
    }

    generateStructuredGameObjects(numObjectsPerRow, objectWidth, objectHeight) {
        let posX = 0;
        let posY = 0;

        for (let i = 0; i < numObjectsPerRow; i++) {
            const obj = new GameObject(posX, posY, objectWidth, objectHeight);
            // obj.target = this.player;

            this.gameObjects.push(obj);

            posX += objectWidth;

            if (posX >= this.mapManager.map.width) {
                posX = 0;
                posY += objectHeight;

                if (posY >= this.mapManager.map.height) {
                    break;
                }
            }
        }
    }

    getCameraPosition() {
        const cameraX = Math.max(0, Math.min(this.player.x + this.player.width / 2 - this.viewportWidth / 2, this.mapManager.map.width - this.viewportWidth));
        const cameraY = Math.max(0, Math.min(this.player.y + this.player.height / 2 - this.viewportHeight / 2, this.mapManager.map.height - this.viewportHeight));
        return { x: cameraX, y: cameraY };
    }

    updateCamera() {

    }

    renderMinimap() {
        this.mapManager.renderMinimap(this.graphicEngine, this.gameObjects, this.player)
    }

    addPlayer(player) {
        this.player = player;

        this.gameObjects.push(this.player);

        this.player.changePosition(this.mapManager.map.width / 2, this.mapManager.map.height / 2);
        this.player.setMapBorders(this.mapManager.map.width, this.mapManager.map.height);

        // this.generateRandomGameObjects(100, 100, 100);
        this.generateStructuredGameObjects(10000, 10, 10);
    }

    handleMouseDown(mouse) {
        return;
        const cameraOffsetX = Math.max(0, Math.min(this.player.x + this.player.width / 2 - this.viewportWidth / 2, this.mapManager.map.width - this.viewportWidth));
        const cameraOffsetY = Math.max(0, Math.min(this.player.y + this.player.height / 2 - this.viewportHeight / 2, this.mapManager.map.height - this.viewportHeight));

        const selectedObject =
            this.getVisibleGameObjects().find(object => {
                return (
                    mouse.x >= object.x - cameraOffsetX &&
                    mouse.x <= object.x + object.width - cameraOffsetX &&
                    mouse.y >= object.y - cameraOffsetY &&
                    mouse.y <= object.y + object.height - cameraOffsetY
                );
            })
        ;

        if (selectedObject) {
            selectedObject.onClick();
        }

        const interfaceClicked =
            this.interfaceElements.find(object => {
                return (
                    mouse.x >= object.x &&
                    mouse.x <= object.x + object.width &&
                    mouse.y >= object.y &&
                    mouse.y <= object.y + object.height
                );
            })
        ;


        if (interfaceClicked) {
            interfaceClicked.onClick()
        }

        if (selectedObject || interfaceClicked) {
            return true;
        }

        return false;
    }

    render() {
        this.graphicEngine.clear();

        const cameraPos = this.getCameraPosition();

        this.graphicEngine.translate(-cameraPos.x, -cameraPos.y);

        this.mapManager.updateAndRender(this.graphicEngine, this);


        this.getVisibleGameObjects()
            .filter(object => object !== this.player)
            .forEach(gameObject => {
                gameObject.render(this.graphicEngine);
            })
        ;

        this.player.onRender(this.graphicEngine);

        this.graphicEngine.restore();

        this.graphicEngine.writeText(`FPS: ${Math.floor(this.fps)}`, 10, 10, 'yellow')
        this.graphicEngine.writeText(`Rendering: ${this.getVisibleGameObjects().length} / ${this.gameObjects.length}`, 10, 20, 'yellow')
    }

    start() {
        setInterval(() => {
            requestAnimationFrame((currentTime) => {
                this.frame(currentTime);
            });

        }, 1000 / 60)
    }

    frame(currentTime) {
        if (!this.lastTime) {
            this.lastTime = currentTime; // Initialize lastTime on the first frame
        }

        this.frameCount++;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.accumulatedTime += deltaTime;

        this.gameObjects
            .forEach(gameObject => {
                gameObject.update();
            })
        ;

        const visibleObjects = this.getVisibleGameObjects();

        for (const obj of visibleObjects) {
            if (this.player.checkCollision(obj)) {
                this.removeObject(obj.id)
            }
        }

        this.handleRemovedObjects();

        this.render();
        this.player.update();
        eventHandler.dispatchEvent(EventType.GAME_TICK, {gameObjects: this.gameObjects});

        this.renderMinimap();

        if (deltaTime >= 1) {
            this.fps = this.frameCount / deltaTime;
            eventHandler.dispatchEvent(EventType.FPS_TICK, {fps: this.fps})
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

    }

    removeObject(objectId) {
        let index = this.gameObjects.findIndex(object => object.id === objectId);
        this.indexesToRemove.push(index);
    }

    getVisibleObjects(objects) {
        const cameraOffsetX = Math.max(0, Math.min(this.player.x + this.player.width / 2 - this.viewportWidth / 2, this.mapManager.map.width - this.viewportWidth));
        const cameraOffsetY = Math.max(0, Math.min(this.player.y + this.player.height / 2 - this.viewportHeight / 2, this.mapManager.map.height - this.viewportHeight));

        return objects.filter(object => {
            const objectRight = object.x + object.width;
            const objectBottom = object.y + object.height;
            const viewportRight = cameraOffsetX + this.viewportWidth;
            const viewportBottom = cameraOffsetY + this.viewportHeight;

            return (
                objectRight > cameraOffsetX &&
                object.x < viewportRight &&
                objectBottom > cameraOffsetY &&
                object.y < viewportBottom
            );
        });
    }

    getVisibleGameObjects() {
        const cameraOffsetX = Math.max(0, Math.min(this.player.x + this.player.width / 2 - this.viewportWidth / 2, this.mapManager.map.width - this.viewportWidth));
        const cameraOffsetY = Math.max(0, Math.min(this.player.y + this.player.height / 2 - this.viewportHeight / 2, this.mapManager.map.height - this.viewportHeight));

        return this.gameObjects.filter(object => {
            const objectRight = object.x + object.width;
            const objectBottom = object.y + object.height;
            const viewportRight = cameraOffsetX + this.viewportWidth;
            const viewportBottom = cameraOffsetY + this.viewportHeight;

            return (
                objectRight > cameraOffsetX &&
                object.x < viewportRight &&
                objectBottom > cameraOffsetY &&
                object.y < viewportBottom
            );
        });
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    handleRemovedObjects() {
        let indexes = new Set(
            this.indexesToRemove.sort((a, b) => {
                return b-a
            })
        );

        indexes.forEach(index => {
            this.gameObjects.splice(index, 1);
        });

        this.indexesToRemove = [];
    }
}