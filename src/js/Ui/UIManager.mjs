import {WeaponSlot} from "../Game/Interface/Element/WeaponSlot.mjs";
import {EventHandler} from "../Event/EventHandler.mjs";
import {EventType} from "../Event/EventType.mjs";
import {InterfaceType} from "../Game/Interface/InterfaceType.mjs";
import {UIButton} from "../Game/Interface/Element/UIButton.mjs";
import {Box} from "../Game/Interface/Element/Box.mjs";
import {GameState} from "../Game/GameState.mjs";

export class UIManager {
    constructor(gameEngine, gridSize = 1) {
        this.gameEngine = gameEngine
        this.elements = [];
        this.graphicEngine = this.gameEngine.graphicEngine;
        this.canvas = this.graphicEngine.canvas;

        this.gridSize = gridSize / 100;

        window.addEventListener("resize", this.handleResize.bind(this));

        eventHandler.addEventHandler(EventType.UI_ELEMENT_CREATE, (element) => {
            console.log(element);
            this.addElement(element);
        })
    }

    addElement(element) {
        element.gridSize = this.gridSize;
        this.elements.push(element);
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

        ctx.strokeStyle = '#888'; // Color for the grid lines
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
            ctx.strokeStyle = '#FF0000'; // Red for element's own guide lines
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
        this.elements.forEach(element => {
            if (edit && element.checkResizeHandleClick(mouse.x, mouse.y, this.canvas)) {
                const handle = element.checkResizeHandleClick(mouse.x, mouse.y, this.canvas);

                if (handle) {
                    element.startResizing(mouse.x, mouse.y, handle, this.canvas);
                    this.resizingElement = element;
                }
            }else if (edit && element.checkClick(mouse.x, mouse.y, this.canvas)) {
                element.startDragging(mouse.x, mouse.y, this.canvas);
                this.draggingElement = element;
            } else {
                if (element.checkClick(mouse.x, mouse.y, this.canvas)) {
                    element.onClick();
                }
            }
        });
    }

    handleMouseMove(mouse) {
        if (this.resizingElement) {
            this.resizingElement.updateSize(mouse.x, mouse.y, this.canvas);
        }else if (this.draggingElement) {
            this.draggingElement.updatePosition(mouse.x, mouse.y, this.canvas);
        } else {
            this.elements.forEach(element => {
                element.checkHover(mouse.x, mouse.y, this.canvas);
            });
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

    render() {
        if (edit) {
            this.renderGridLines();
            this.renderGuideLines();
        }

        this.elements.sort((a, b) => a.index - b.index).forEach(element => {
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

        const editButton = new UIButton(0.17, 0.04, 0.08, 0.02, "Edit", () => {
            eventHandler.dispatchEvent(EventType.TOGGLE_PAUSE, {});

            window.edit = !window.edit;
        }).setIndex(1);

        const box = new Box(0, 0, 1, 0.09)
        box.color = 'black';

        this.addElement(box);
        this.addElement(startButton);
    }

    renderMainMenu() {

    }
}