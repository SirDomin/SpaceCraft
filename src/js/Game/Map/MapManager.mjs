import {EventType} from "../../Event/EventType.mjs";
import {ParticleSystem} from "./ParticleSystem.mjs";

export class MapManager {
    x;
    y;
    baseX;
    baseY;

    constructor(map) {
        this.map = {
            width: 10000,
            height: 10000,
        };
        this.minimapSize = 200;
        this.scale = this.minimapSize / this.map.width;
        this.borderWidth = 2;
        this.borderColor = 'white';
        this.color = 'black';

        this.particleSystem = new ParticleSystem(this.map.width, this.map);

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


    getBackgroundGradient(graphicEngine, x, y, width, height) {
        const gradient = graphicEngine.ctx.createRadialGradient(
            x + width / 2, y + height / 2, 0, // Inner circle (center, start radius)
            x + width / 2, y + height / 2, width / 2 // Outer circle (center, end radius)
        );

        const colors = [
            '#000055', '#00004D', '#000045', '#00003D', '#000035',
            '#00002D', '#000025', '#00001D', '#000015', '#000000'
        ];

        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }

        return gradient;
    }
    emitBackground(graphicEngine, x = 0, y = 0, width = this.map.width, height = this.map.height) {
        graphicEngine.ctx.fillStyle = this.getBackgroundGradient(graphicEngine, x, y, width, height);
        graphicEngine.ctx.fillRect(x, y, width, height);
    }

    renderMinimap(graphicEngine, objects, player) {
        graphicEngine.ctx.clearRect(this.x , this.y, this.minimapSize, this.minimapSize);

        graphicEngine.drawSquare(this.x - this.borderWidth, this.y - this.borderWidth, this.minimapSize + this.borderWidth * 2, this.minimapSize + this.borderWidth * 2, this.borderColor)

        graphicEngine.ctx.fillStyle = this.getBackgroundGradient(graphicEngine, this.x, this.y, this.minimapSize, this.minimapSize);
        graphicEngine.ctx.fillRect(this.x, this.y, this.minimapSize, this.minimapSize);

        objects.filter(object => object !== player).forEach(obj => {
            obj.renderOnMinimap({scale: this.scale, x: this.x, y: this.y}, graphicEngine)
        });

        player.renderOnMinimap({scale: this.scale, x: this.x, y: this.y}, graphicEngine)
    }

}