import {EventType} from "../Event/EventType.mjs";
import {GameObject} from "../Game/Object/GameObject.mjs";
import {Asteroid} from "../Game/Object/Asteroid.mjs";
import {MapManager} from "../Game/Map/MapManager.mjs";
import {Nebula} from "../Game/Object/Nebula.mjs";
import {UIManager} from "../Ui/UIManager.mjs";
import {EffectEngine} from "./EffectEngine.mjs";
import {UIText} from "../Game/Interface/Element/UIText.mjs";
import {GameState} from "../Game/GameState.mjs";

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

        this.effectEngine = new EffectEngine(this);

        this.viewportWidth = this.graphicEngine.canvas.width;
        this.viewportHeight = this.graphicEngine.canvas.height;
        this.uiManager = new UIManager(this);

        this.mapManager = new MapManager().setPosition(graphicEngine.canvas.width, 75).setSize(70);
        this.lastTime = 0; // Time of the last frame
        this.frameCount = 0; // Number of frames counted
        this.fps = 0; // FPS value
        this.accumulatedTime = 0;

        this.debugData = {
            fps: new UIText(0.07, 0.01, 'test', '10px', 'lime').setIndex(1).init(),
            position: new UIText(0.07, 0.02, 'test', '10px', 'lime').setIndex(1).init(),
            rendering: new UIText(0.07, 0.03, 'test', '10px', 'lime').setIndex(1).init(),
            calculations: new UIText(0.07, 0.04, 'test', '10px', 'lime').setIndex(1).init(),
        }

        this.offsetY = 75;
        eventHandler.addEventHandler(EventType.PLAYER_ROTATE, (data) => {
            this.updateCamera(data.rotation);
        }, 'player.rotation', false, 10)

        eventHandler.addEventHandler(EventType.OBJECT_CREATED, object => {
            this.addGameObject(object);
        });

        eventHandler.addEventHandler(EventType.REMOVE_OBJECT, object => {
            this.removeObject(object.id);
        });

        eventHandler.addKeyHandler(27, () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {});
        }, true);

        eventHandler.addEventHandler(EventType.TOGGLE_PAUSE, () => {
            this.togglePause();
        })

        eventHandler.addEventHandler(EventType.PROJECTILE_HIT, (eventData) => {
            const { x, y, projectile } = eventData;
            switch (projectile.effect) {
                case 'explosion':
                    this.effectEngine.applyExplosionEffect(x, y, projectile);
                    break;
                case 'electronic_charge':
                    this.effectEngine.applyElectronicChargeEffect(x, y, projectile);
                    break;
                case 'acid_splash':
                    this.effectEngine.applyAcidSplashEffect(x, y, projectile);
                    break;
                case 'void_rift':
                    this.effectEngine.applyVoidRiftEffect(x, y, projectile);
                    break;
                // Add more cases as needed
                default:
                    // No special effect
                    break;
            }
        });
    }

    togglePause() {
        if (window.edit === true) {
            window.edit = false;

            if (this.isPaused === true) {
                this.isPaused = false;
            }

            return;
        }

        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            console.log('Game Paused');
        } else {
            console.log('Game Resumed')
            this.lastTime = performance.now();
            this.accumulatedTime = 0;
        }

        let state;
        if (this.isPaused) {
            state = GameState.PAUSE;
        } else {
            state = GameState.GAME;
        }
        
        eventHandler.dispatchEvent(EventType.GAME_STATE_CHANGE, {state: state})
    }

    pause() {
        this.isPaused = true;
    }

    generateRandomGameObjects(numObjects, objectWidth, objectHeight) {
        for (let i = 0; i < numObjects; i++) {
            const posx = Math.floor(Math.random() * (this.mapManager.map.width - objectWidth));
            const posy = Math.floor(Math.random() * (this.mapManager.map.height - objectHeight));

            const obj = new Nebula(posx, posy, objectWidth, objectHeight);
            obj.target = this.player

            this.gameObjects.push(obj);
        }

        // const asteroid = new Asteroid(this.player.x, this.player.y);
        // this.gameObjects.push(asteroid);

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

        return { x: cameraX, y: cameraY - this.offsetY };
    }

    updateCamera() {

    }

    renderMinimap() {
        eventHandler.dispatchEvent(EventType.UPDATE_MINIMAP, {
            gameObjects: this.gameObjects,
            player: this.player,
        })
    }

    addPlayer(player) {
        this.player = player;

        this.gameObjects.push(this.player);

        this.player.changePosition(this.mapManager.map.width / 2, this.mapManager.map.height / 2);
        this.player.setMapBorders(this.mapManager.map.width, this.mapManager.map.height - this.offsetY);

        this.player.setCamera(this.viewportWidth, this.viewportHeight);

        this.generateRandomGameObjects(100, 100, 100);
        // this.generateStructuredGameObjects(50000, 10, 10);

        this.uiManager.generateUI();
    }

    handleMouseHover(mouse) {
        this.uiManager.handleMouseMove(mouse);
    }

    handleMouseUp(mouse) {
        this.uiManager.handleMouseUp(mouse);
    }

    handleMouseDown(mouse) {
        this.uiManager.handleMouseDown(mouse);

        const cameraOffsetX = this.getCameraPosition().x;
        const cameraOffsetY = this.getCameraPosition().y;

        const playerElementClicked = this.player.checkClick(mouse);

        if (playerElementClicked) {
            return true;
        }

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

        window.cameraPos = cameraPos;

        this.graphicEngine.translate(-cameraPos.x, -cameraPos.y);

        this.renderBackground();
        this.renderGameObjects();

        this.player.onRender(this.graphicEngine);

        this.graphicEngine.restore();

        this.renderDebugInfo();
        this.renderUI();

        this.renderMinimap();

    }

    updateBackground(deltaTime) {
        this.mapManager.update(deltaTime);
    }

    renderBackground() {
        this.mapManager.render(this.graphicEngine, this);
    }

    renderGameObjects() {
        const visibleObjects = this.getVisibleGameObjects();
        visibleObjects.forEach(object => object.render(this.graphicEngine));
        this.player.render(this.graphicEngine);
    }

    renderUI() {
        this.uiManager.render(this.graphicEngine);
    }

    renderDebugInfo() {
        // this.graphicEngine.ctx.fillStyle = 'black';
        // this.graphicEngine.ctx.font = '10px Arial';
        // this.graphicEngine.ctx.textAlign = 'left';
        // this.graphicEngine.drawSquare(0, 0, this.viewportWidth, this.offsetY, 'black');
        // this.graphicEngine.writeText(`FPS: ${Math.floor(this.fps)}`, 10, 10, 'yellow');
        // // this.graphicEngine.writeText(`Rendering: ${this.getVisibleGameObjects().length} / ${this.gameObjects.length}`, 10, 20, 'yellow');
        // this.graphicEngine.writeText(`Position: X: ${Math.floor(this.player.x)} Y: ${Math.floor(this.player.y)}`, 10, 30, 'yellow');
        // this.graphicEngine.writeText(`Calculations: ${this.visibleObjectsCalculations}`, 10, 40, 'yellow');
        //
        // this.interfaceElements.forEach(interfaceElement => {
        //     interfaceElement.render(this.graphicEngine);
        // });
        this.debugData.fps.setText(`FPS: ${Math.floor(this.fps)}`)
        this.debugData.rendering.setText(`Rendering: ${this.getVisibleGameObjects().length} / ${this.gameObjects.length}`)
        this.debugData.position.setText(`Position: X: ${Math.floor(this.player.x)} Y: ${Math.floor(this.player.y)}`)
        this.debugData.calculations.setText(`Calculations: ${this.visibleObjectsCalculations}`)


        this.debug();
    }

    debug() {
        if (window.renderCollisions === true) {
            const cameraOffsetX = this.getCameraPosition().x;
            const cameraOffsetY = this.getCameraPosition().y;

            this.player.getVertices(true).forEach(v => {
                gameEngine.graphicEngine.drawSquare(v.x - cameraOffsetX - 1, v.y - cameraOffsetY - 1, 2, 2, 'red')
            });
        }
    }

    start() {
        this.lastTime = performance.now();
        this.accumulatedTime = 0;
        this.timeStep = 1000 / 60; // Fixed time step in milliseconds (60 updates per second)

        const loop = (currentTime) => {
            this.frame(currentTime);
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    frame(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.accumulatedTime += deltaTime;

        if (!this.isPaused) {
            while (this.accumulatedTime >= this.timeStep) {
                this.update(this.timeStep / 1000);
                this.accumulatedTime -= this.timeStep;
            }
        } else {
            eventHandler.tick(0);
        }

        this.render();

        this.fps = 1000 / deltaTime;
    }

    update(deltaTime) {
        if (deltaTime === 0) return;

        this.gameObjects.forEach(gameObject => {
            gameObject.update(deltaTime);
        });

        this.updateBackground(deltaTime);
        this.renderBackground();

        this.gameObjects.forEach((gameObject, index) => {
            if (gameObject.collisionObjects && gameObject.collisionObjects.length > 0) {
                this.gameObjects.forEach((otherObject, otherIndex) => {
                    if (index !== otherIndex) {
                        if (gameObject.collisionObjects.includes(otherObject.type)) {
                            if (gameObject.checkCollision(otherObject)) {
                                gameObject.onCollision(otherObject);
                            }
                        }
                    }
                });
            }
        });

        const visibleObjects = this.getVisibleGameObjects();
        for (const obj of visibleObjects) {
            if (this.player.checkCollision(obj)) {
                this.player.onCollision(obj);
                obj.onCollision(this.player);
            }
        }

        this.visibleObjectsCalculations = visibleObjects.length;

        this.handleRemovedObjects();

        eventHandler.tick(deltaTime);

        eventHandler.dispatchEvent(EventType.GAME_TICK, { gameObjects: this.gameObjects });
        eventHandler.dispatchEvent(EventType.VISIBLE_OBJECTS_TICK, { gameObjects: visibleObjects });
    }

    removeObject(objectId) {
        this.gameObjects = this.gameObjects.filter(object => object.id !== objectId);
    }

    getVisibleAndClosestObjects(referenceObject) {
        const proximityThreshold = 100;

        const visibleObjects = this.getVisibleGameObjects();

        return visibleObjects.filter(object => {
            const objectCenterX = object.x + object.width / 2;
            const objectCenterY = object.y + object.height / 2;
            const refCenterX = referenceObject.x + referenceObject.width / 2;
            const refCenterY = referenceObject.y + referenceObject.height / 2;

            const distanceX = Math.max(0, Math.abs(objectCenterX - refCenterX) - (object.width / 2 + referenceObject.width / 2));
            const distanceY = Math.max(0, Math.abs(objectCenterY - refCenterY) - (object.height / 2 + referenceObject.height / 2));

            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            return distance <= proximityThreshold;
        });
    }

    getVisibleObjects(objects) {
        const cameraOffsetX = this.getCameraPosition().x;
        const cameraOffsetY = this.getCameraPosition().y;

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

    getObjectsByType(type) {
        return this.getVisibleGameObjects().filter(object => object.type === type);
    }

    isObjectVisible(object) {
        const cameraOffsetX = this.getCameraPosition().x;
        const cameraOffsetY = this.getCameraPosition().y;

        const objectRight = object.x + object.width;
        const objectBottom = object.y + object.height;
        const viewportRight = cameraOffsetX + this.viewportWidth;
        const viewportBottom = cameraOffsetY + this.viewportHeight;

        return (
            objectRight > cameraOffsetX &&
            object.x - object.width * 1.5 < viewportRight &&
            objectBottom > cameraOffsetY &&
            object.y - object.height < viewportBottom
        );
    }

    getVisibleGameObjects() {
        const { x: camX, y: camY } = this.getCameraPosition();
        const viewportRight = camX + this.viewportWidth;
        const viewportBottom = camY + this.viewportHeight;

        return this.gameObjects.filter(({ x, y, width, height, alwaysVisible }) => {
            return (
                x + width > camX &&
                x < viewportRight &&
                y + height > camY &&
                y < viewportBottom || alwaysVisible
            );
        });
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    addInterfaceElement(interfaceElement) {
        this.interfaceElements.push(interfaceElement);
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