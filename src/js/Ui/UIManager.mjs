import {EventType} from "../Event/EventType.mjs";
import {UIButton} from "../Game/Interface/Element/UIButton.mjs";
import {Box} from "../Game/Interface/Element/Box.mjs";
import {GameState} from "../Game/GameState.mjs";
import {UISlider} from "../Game/Interface/Element/UISlider.mjs";
import {UIText} from "../Game/Interface/Element/UIText.mjs";
import {ScrollableView} from "../Game/Interface/Element/ScrollableView.mjs";
import {GameViewState} from "../Game/GameViewState.mjs";

export class UIManager {
    constructor(gameEngine, gridSize = 1) {
        this.gameEngine = gameEngine
        this.elements = [];
        this.graphicEngine = this.gameEngine.graphicEngine;
        this.canvas = this.graphicEngine.canvas;

        this.gridSize = gridSize / 100;

        window.addEventListener("resize", this.handleResize.bind(this));

        eventHandler.addEventHandler(EventType.UI_ELEMENT_CREATE, (element) => {
            this.addElement(element, element.index);
        });

        eventHandler.addEventHandler(EventType.UI_ELEMENT_REMOVE, (elementId) => {
            this.removeElement(elementId)
        });
    }

    addElement(element, index = 1) {
        element.gridSize = this.gridSize;
        element.index = index;
        this.elements.push(element);
    }

    removeElement(id) {
        this.elements = this.elements.filter((element) => element.id !== id);
    }

    renderGuideLines() {
        const ctx = this.graphicEngine.ctx;
        const canvas = this.canvas;

        if (edit) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
        }
    }

    renderGridLines() {
        const ctx = this.graphicEngine.ctx;
        const canvas = this.canvas;

        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;

        for (let y = 0; y <= canvas.height; y += canvas.height * this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        for (let x = 0; x <= canvas.width; x += canvas.width * this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }

    renderElementGuideLines(element) {
        const ctx = this.graphicEngine.ctx;
        const canvas = this.canvas;
        const elementX = element.xPercent * canvas.width;
        const elementY = element.yPercent * canvas.height;
        const elementWidth = element.widthPercent * canvas.width;
        const elementHeight = element.heightPercent * canvas.height;

        if (element.isDragging) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, elementY + elementHeight / 2);
            ctx.lineTo(canvas.width, elementY + elementHeight / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(elementX + elementWidth / 2, 0);
            ctx.lineTo(elementX + elementWidth / 2, canvas.height);
            ctx.stroke();
        }
    }

    handleMouseDown(mouse) {
        const elements = this.elements.sort((a, b) => b.index - a.index);

        for (const element of elements) {
            if (edit && element.checkResizeHandleClick(mouse.x, mouse.y, this.canvas)) {
                const handle = element.checkResizeHandleClick(mouse.x, mouse.y, this.canvas);

                if (handle) {
                    element.startResizing(mouse.x, mouse.y, handle, this.canvas);
                    this.resizingElement = element;
                    break;
                }
            } else if (edit && element.checkClick(mouse.x, mouse.y, this.canvas)) {
                if (!this.draggingElement) {
                    element.startDragging(mouse.x, mouse.y, this.canvas);
                    this.draggingElement = element;
                    break;
                }
            } else if (!edit && element.isDraggable && element.checkHandleClick(mouse.x, mouse.y, this.canvas) && element.visible) {
                element.startHandle(mouse.x, mouse.y, this.canvas);
                break;
            } else if (!edit && element.visible) {
                if (element.checkClick(mouse.x, mouse.y, this.canvas)) {
                    element.onClick();
                    break;
                }
            }
        }
    }

    handleMouseMove(mouse) {
        if (this.resizingElement) {
            this.resizingElement.updateSize(mouse.x, mouse.y, this.canvas);
        } else if (this.draggingElement) {
            this.draggingElement.updatePosition(mouse.x, mouse.y, this.canvas);
        } else {
            const elements = this.elements.sort((a, b) => b.index - a.index);

            let hoveringElement = null;

            for (const element of elements) {
                const hovering = element.checkHover(mouse.x, mouse.y, this.canvas);

                if (hovering && !hoveringElement) {
                    hoveringElement = element;
                    element.hovering = true;
                    element.opacity = 0.8;
                    break;
                } else {
                    element.hovering = false;
                    element.opacity = 1;
                }

                if (element.isDraggable === true && element.draggingHandle) {
                    element.updateHandlePosition(mouse.x, mouse.y, this.canvas);
                }
            }
        }
    }
    handleMouseUp(mouse) {
        if (this.resizingElement) {
            this.resizingElement.stopResizing();
            this.resizingElement = null;
        }
        if (this.draggingElement) {
            this.draggingElement.stopDragging();
            this.draggingElement = null;
        }
    }

    handleResize() {
        this.render();
    }

    scale(element) {
        const dimensions = element.getDimensions(this.canvas);
        return {
            x: dimensions.x,
            y: dimensions.y,
            width: dimensions.width,
            height: dimensions.height,
        };
    }

    scaleChild(parent, child) {
        const dimensions = parent.getDimensions(this.canvas);
        const childDimensions = child.getDimensions(dimensions);

        return {
            x: childDimensions.x,
            y: childDimensions.y,
            width: childDimensions.width,
            height: childDimensions.height,
        };
    }

    render() {
        if (edit) {
            this.renderGridLines();
            this.renderGuideLines();
        }

        this.elements.sort((a, b) => a.index - b.index).filter(element => {
            if (edit) {
                return element;
            }
            return element.visible;
        }).forEach(element => {
            if (element.constructor.name === ScrollableView.prototype.constructor.name) {
                element.children.forEach(child => {
                    child.scale = this.scaleChild(element, child);
                })
            }

            const scaled = this.scale(element);
            element.render(this.graphicEngine, scaled);

            if (element.isDragging) {
                this.renderElementGuideLines(element);
            }

            element.renderResizeHandles(this.graphicEngine, this.canvas);
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
        this.elements = [];

        const startButton = new UIButton(0.17, 0.01, 0.08, 0.02, "Pause", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {});
        });

        eventHandler.addEventHandler(EventType.GAME_STATE_CHANGE, (event) => {
            if (event.state === GameState.PAUSE) {
                startButton.text = 'Resume';
            } else if (event.state === GameState.GAME) {
                startButton.text = 'Pause';
            }
        })

        const editButton = new UIButton(0.17, 0.05, 0.08, 0.02, "Edit", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {force: true});
            window.edit = !window.edit;
        }).setIndex(1);

        const debugCollisionButton = new UIButton(0.26, 0.05, 0.08, 0.02, "DEBUG", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_DEBUG, {});
        }).setIndex(1);

        const slowMoToggleButton = new UIButton(0.26, 0.01, 0.08, 0.02, "SLOWMO", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_SLOWMO, {speed: 0});
        }).setIndex(1);

        const box = new Box(0, 0, 1, 0.09)
        box.color = 'black';

        const gameSpeedInfo = new UIText(0.385, 0.02, 'test', '10px', 'lime').setIndex(5).setTextAlign('left')
        gameSpeedInfo.visible = false;

        const gameSpeedSlider = new UISlider(0.35, 0.01, 0.08, 0.01, 0, 1, 1, (value) => {
            eventHandler.dispatchEvent(EventType.GAME_SPEED_CHANGE, {speed: value});

            gameSpeedInfo.text = Math.floor(value * 100) / 100;
        });

        const shopGameButton = new UIButton(0.44, 0.01, 0.08, 0.02, "Shop", () => {
            eventHandler.dispatchEvent(EventType.GAME_VIEW_CHANGE, {state: GameViewState.SHOP});
        }).setIndex(1);


        eventHandler.addEventHandler(EventType.SLOWMO_CHANGE, data => {
            gameSpeedSlider.visible = data.slowmo === true;
            gameSpeedInfo.visible = data.slowmo === true;
            gameSpeedSlider.handlePercentX = 0;
            gameSpeedInfo.text = 0;
        })

        const spawnEnemies = new UIButton(0.35, 0.05, 0.08, 0.02, "Spawn", () => {
            eventHandler.dispatchEvent(EventType.SPAWN_ENEMIES);
        }).setIndex(1);

        gameSpeedSlider.visible = false;

        Object.keys(this.gameEngine.debugData).forEach(key => {
            this.addElement(this.gameEngine.debugData[key], 15);
        })
        this.addElement(this.gameEngine.mapManager.minimap, 10);
        this.addElement(box, 0);
        this.addElement(spawnEnemies, 5);
        this.addElement(editButton, 5);
        this.addElement(debugCollisionButton, 5);
        this.addElement(slowMoToggleButton, 5);
        this.addElement(startButton, 5);
        this.addElement(gameSpeedSlider, 10);
        this.addElement(gameSpeedInfo, 10);
        this.addElement(shopGameButton, 10);
    }

    renderMainMenu() {
        this.elements = [];
    }
}