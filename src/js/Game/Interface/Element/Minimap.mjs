import {UIElement} from "./UIElement.mjs";
import {EventType} from "../../../Event/EventType.mjs";

export class Minimap extends UIElement {
    constructor(xPercent, yPercent, widthPercent, heightPercent, mapWidth, mapHeight, borderWidth = 1, borderColor = 'white') {
        super(xPercent, yPercent, widthPercent, heightPercent);

        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.scale = 1;

        this.responsive = false;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.objects = [];
        this.player = null;

        this.initialWidth = 75;
        this.initialHeight = 75;

        eventHandler.addEventHandler(EventType.UPDATE_MINIMAP, data => {
            this.player = data.player;
            this.objects = data.gameObjects;
        })
        this.index = 1;
    }

    calculateScale() {
        this.scale = 0.015
    }

    getBackgroundGradient(graphicEngine, x, y, width, height) {
        const gradient = graphicEngine.ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(1, '#666');
        return gradient;
    }

    render(graphicEngine) {
        const canvas = graphicEngine.canvas;

        this.initializeNonResponsive(canvas);

        const dimensions = this.getDimensions(canvas);
        const scaled = {
            x: dimensions.x,
            y: dimensions.y,
            width: dimensions.width,
            height: dimensions.height,
        };

        this.calculateScale(canvas, scaled);

        graphicEngine.ctx.clearRect(scaled.x, scaled.y, scaled.width, scaled.height);

        graphicEngine.drawSquare(
            scaled.x - this.borderWidth, scaled.y - this.borderWidth,
            scaled.width + this.borderWidth * 2, scaled.height + this.borderWidth * 2,
            this.borderColor
        );

        graphicEngine.ctx.fillStyle = this.getBackgroundGradient(graphicEngine, scaled.x, scaled.y, scaled.width, scaled.height);
        graphicEngine.ctx.fillRect(scaled.x, scaled.y, scaled.width, scaled.height);

        this.objects.filter(object => object !== this.player).forEach(obj => {
            obj.renderOnMinimap({ scale: this.scale, x: scaled.x, y: scaled.y }, graphicEngine);
        });

        if (this.player) {
            this.player.renderOnMinimap({ scale: this.scale, x: scaled.x, y: scaled.y }, graphicEngine);
        }
    }
}