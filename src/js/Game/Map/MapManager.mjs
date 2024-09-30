import {EventType} from "../../Event/EventType.mjs";
import {ParticleSystem} from "./ParticleSystem.mjs";

export class MapManager {
    x;
    y;
    baseX;
    baseY;

    constructor(map) {
        this.map = {
            width: 1000,
            height: 1000,
        };
        this.minimapSize = 200;
        this.scale = this.minimapSize / this.map.width;
        this.borderWidth = 5;
        this.borderColor = 'black';

        this.particleSystem = new ParticleSystem(500, this.map);

        eventHandler.addEventHandler(EventType.RENDER_MINIMAP, e => {
            this.renderMinimap(e.graphicEngine, e.objects, e.player)
        }, 'minimap.render', false, 10);

        return this;
    }

    setPosition(x, y) {
        this.x = x - this.minimapSize - this.borderWidth;
        this.y = y - this.minimapSize - this.borderWidth;

        this.baseX = x;
        this.baseY = y;

        return this;
    }

    setSize(size) {
        this.minimapSize = size;
        this.scale = this.minimapSize / this.map.width;

        this.setPosition(this.baseX, this.baseY);

        return this;
    }

    updateAndRender(graphicEngine, gameEngine) {
        this.emitBackground(graphicEngine);

        this.particleSystem.updateAndRender(graphicEngine, gameEngine);
    }

    drawNebula(graphicEngine, x, y, size, color) {
        const nebulaGradient = graphicEngine.ctx.createRadialGradient(x, y, 0, x, y, size);
        nebulaGradient.addColorStop(0, color);
        nebulaGradient.addColorStop(1, 'transparent');

        graphicEngine.ctx.fillStyle = nebulaGradient;
        graphicEngine.ctx.beginPath();
        graphicEngine.ctx.arc(x, y, size, 0, Math.PI * 2);
        graphicEngine.ctx.fill();
    }


    emitBackground(graphicEngine) {
        const gradient = graphicEngine.ctx.createLinearGradient(0, 0, this.map.width, this.map.height);
        gradient.addColorStop(0, '#000022');
        gradient.addColorStop(0.5, '#000011');
        gradient.addColorStop(1, '#000000');

        graphicEngine.ctx.fillStyle = gradient;
        graphicEngine.ctx.fillRect(0, 0, this.map.width, this.map.height);
    }

    renderMinimap(graphicEngine, objects, player) {
        graphicEngine.ctx.clearRect(this.x , this.y, this.minimapSize, this.minimapSize);

        graphicEngine.drawSquare(this.x - this.borderWidth, this.y - this.borderWidth, this.minimapSize + this.borderWidth * 2, this.minimapSize + this.borderWidth * 2, this.borderColor)
        objects.filter(object => object !== player).forEach(obj => {
            obj.renderOnMinimap({scale: this.scale, x: this.x, y: this.y}, graphicEngine)
        });

        player.renderOnMinimap({scale: this.scale, x: this.x, y: this.y}, graphicEngine)
    }

}