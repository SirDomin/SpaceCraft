import {Enemy} from "./Enemy.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {Utils} from "../../Utils/Utils.mjs";
import {Hitmark} from "./Hitmark.mjs";

export class EnemyDestruction {
    constructor(image, x, y, width, height, duration = 3000) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.duration = duration;
        this.startTime = Date.now();
        this.pieces = [];
        this.numPieces = Utils.random(5, 20);
        this.createPieces();
    }

    static fromEnemy(enemy) {
        const destruction =  new EnemyDestruction(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height, 3000);

        const hitmark = new Hitmark(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width, enemy.height, 100, 100, 500);
        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);

        const explosionSound = loader.getAudio('explosion1');

        const audio = new Audio(explosionSound.src);
        audio.play();

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, destruction);

        return destruction;
    }

    renderOnMinimap() {

    }

    update() {

    }

    createPieces() {
        const pieceWidth = this.width / Math.ceil(Math.sqrt(this.numPieces));
        const pieceHeight = this.height / Math.ceil(Math.sqrt(this.numPieces));

        for (let i = 0; i < this.numPieces; i++) {
            const offsetX = (i % Math.ceil(Math.sqrt(this.numPieces))) * pieceWidth;
            const offsetY = Math.floor(i / Math.ceil(Math.sqrt(this.numPieces))) * pieceHeight;

            this.pieces.push({
                x: this.x + offsetX + Math.random() * 10 - 5,
                y: this.y + offsetY + Math.random() * 10 - 5,
                width: pieceWidth,
                height: pieceHeight,
                floatX: Math.random() * 200 - 100,
                floatY: Math.random() * 200 - 100,
                sourceX: offsetX,
                sourceY: offsetY,
            });
        }
    }

    render(graphicEngine) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;

        if (elapsedTime < this.duration) {
            for (const piece of this.pieces) {
                piece.x += piece.floatX * (1 / 60);
                piece.y += piece.floatY * (1 / 60);

                const imageBaseWidth = this.image.width / Math.ceil(Math.sqrt(this.numPieces))
                const imageBaseHeight = this.image.height / Math.ceil(Math.sqrt(this.numPieces))

                graphicEngine.ctx.drawImage(
                    this.image,
                    piece.sourceX / 10 * imageBaseWidth, piece.sourceY / 10 * imageBaseHeight, imageBaseWidth, imageBaseHeight,
                    piece.x, piece.y, piece.width, piece.height
                );
            }

        } else {
            eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);
        }
    }
}