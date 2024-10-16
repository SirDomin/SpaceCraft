import { EventType } from "../../Event/EventType.mjs";
import { Utils } from "../../Utils/Utils.mjs";
import { Hitmark } from "./Hitmark.mjs";

export class EnemyDestruction {
    constructor(image, x, y, width, height, duration = 1) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.duration = duration;
        this.age = 0;
        this.pieces = [];
        this.id = Utils.generateId();
        this.numPieces = Utils.random(5, 20);
        this.createPieces();
    }

    static fromEnemy(enemy) {
        const destruction = new EnemyDestruction(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            1
        );

        const hitmark = new Hitmark(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            enemy.width,
            enemy.height,
            100,
            100,
            0.5
        );

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);

        const explosionSound = loader.getAudio('explosion1');
        const audio = new Audio(explosionSound.src);
        audio.play();

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, destruction);

        return destruction;
    }

    renderOnMinimap() {}

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.duration) {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
            return;
        }

        const lifeProgress = this.age / this.duration;
        const opacity = 1 - lifeProgress;

        for (const piece of this.pieces) {
            piece.x += piece.floatX * deltaTime;
            piece.y += piece.floatY * deltaTime;
            piece.opacity = opacity;
        }
    }

    createPieces() {
        const gridSize = Math.ceil(Math.sqrt(this.numPieces));
        const pieceWidth = this.width / gridSize;
        const pieceHeight = this.height / gridSize;
        const imagePieceWidth = this.image.width / gridSize;
        const imagePieceHeight = this.image.height / gridSize;

        for (let i = 0; i < this.numPieces; i++) {
            const gridX = i % gridSize;
            const gridY = Math.floor(i / gridSize);

            const offsetX = gridX * pieceWidth;
            const offsetY = gridY * pieceHeight;

            const sourceX = gridX * imagePieceWidth;
            const sourceY = gridY * imagePieceHeight;

            this.pieces.push({
                x: this.x + offsetX + Math.random() * 10 - 5,
                y: this.y + offsetY + Math.random() * 10 - 5,
                width: pieceWidth,
                height: pieceHeight,
                floatX: Math.random() * 200 - 100,
                floatY: Math.random() * 200 - 100,
                sourceX: sourceX,
                sourceY: sourceY,
                sourceWidth: imagePieceWidth,
                sourceHeight: imagePieceHeight,
                opacity: 1,
            });
        }
    }

    render(graphicEngine) {
        for (const piece of this.pieces) {
            graphicEngine.ctx.save();
            graphicEngine.ctx.globalAlpha = piece.opacity;
            graphicEngine.ctx.drawImage(
                this.image,
                piece.sourceX,
                piece.sourceY,
                piece.sourceWidth,
                piece.sourceHeight,
                piece.x,
                piece.y,
                piece.width,
                piece.height
            );
            graphicEngine.ctx.restore();
        }
    }
}
