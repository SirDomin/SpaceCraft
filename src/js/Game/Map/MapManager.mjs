import {EventType} from "../../Event/EventType.mjs";
import {ParticleSystem} from "./ParticleSystem.mjs";
import {Galaxy} from "./Galaxy.mjs";
import {Minimap} from "../Interface/Element/Minimap.mjs";

export class MapManager {
    x;
    y;
    baseX;
    baseY;

    constructor(map) {
        this.map = {
            width: 5000,
            height: 5000,
        };
        this.minimapSize = 200;
        this.scale = this.minimapSize / this.map.width;
        this.borderWidth = 2;
        this.borderColor = 'white';
        this.color = 'black';

        this.particleSystem = new ParticleSystem(this.map.width, this.map);
        this.mapObjects = [];

        this.minimap = new Minimap(0.002, 0.002, 0.07, 0.08, this.map.width, this.map.height);
        this.minimap.getBackgroundGradient = this.getBackgroundGradient;
        this.minimap.index = 5;

        const coordinates = this.getRandomCoordinatesOnMap(2000)
        const galaxy = new Galaxy(coordinates.x, coordinates.y).setGalaxyRadius(400).setNumStars(200);
        this.mapObjects.push(galaxy)

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

    getRandomCoordinatesOnMap(margin) {
        const x = Math.random() * (this.map.width - 2 * margin) + margin;
        const y = Math.random() * (this.map.height - 2 * margin) + margin;

        return { x: Math.floor(x), y: Math.floor(y) };
    }

    update(deltaTime) {
        this.particleSystem.update(deltaTime);

        this.mapObjects.forEach(object => {
            object.update(deltaTime);
        })
    }

    render(graphicEngine, gameEngine) {
        this.emitBackground(graphicEngine);

        this.particleSystem.updateAndRender(graphicEngine, gameEngine);

        this.mapObjects.forEach(object => {
            if (gameEngine.isObjectVisible(object)) {
                object.render(graphicEngine);
            }
        })
    }

    getBackgroundGradient(graphicEngine, x, y, width, height) {
        const gradient = graphicEngine.ctx.createRadialGradient(
            x + width / 2, y + height / 2, 0,
            x + width / 2, y + height / 2, width / 2
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