import { EventType } from "../../Event/EventType.mjs";
import { Utils } from "../../Utils/Utils.mjs";
import { Hitmark } from "./Hitmark.mjs";
import {Particle} from "./Particle.mjs";

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
        this.particles = [];
        this.id = Utils.generateId();
        this.numPieces = 10;
        this.createPieces();
        this.createParticles();
    }

    static fromEnemy(enemy) {
        const destruction = new EnemyDestruction(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            0.3,
        );

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
        const easingProgress = this.easeOutQuad(lifeProgress) * 0.1;

        for (const piece of this.pieces) {
            piece.x += piece.velocityX * deltaTime;
            piece.y += piece.velocityY * deltaTime;
            piece.scale = 1 - easingProgress;
            piece.rotation += piece.rotationSpeed * deltaTime;
            piece.opacity = 1 - lifeProgress;
        }

        for (const particle of this.particles) {
            particle.update(deltaTime);
        }

        this.particles = this.particles.filter(p => p.isAlive());
    }

    createPieces() {
        const gridSize = Math.ceil(Math.sqrt(this.numPieces));
        const imagePieceWidth = this.image.width / gridSize;
        const imagePieceHeight = this.image.height / gridSize;

        const pieceWidth = this.width / gridSize;
        const pieceHeight = this.height / gridSize;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < this.numPieces; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(1, 10);

            const gridX = i % gridSize;
            const gridY = Math.floor(i / gridSize);

            const offsetX = gridX * pieceWidth;
            const offsetY = gridY * pieceHeight;


            const distance = Utils.random(200, 500); // Adjust as needed
            const targetX = centerX + Math.cos(angle) * distance;
            const targetY = centerY + Math.sin(angle) * distance;

            const velocityX = (targetX - (this.x + offsetX)) / this.duration * 0.5;
            const velocityY = (targetY - (this.y + offsetY)) / this.duration * 0.5;

            const rotationSpeed = Utils.random(-Math.PI, Math.PI);

            const sourceX = gridX * imagePieceWidth;
            const sourceY = gridY * imagePieceHeight;

            this.pieces.push({
                x: this.x + this.width,
                y: this.y + this.height,
                width: pieceWidth,
                height: pieceHeight,
                velocityX: velocityX,
                velocityY: velocityY,
                rotation: 0,
                rotationSpeed: rotationSpeed,
                scale: 1,
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

    createParticles() {
        const numParticles = 20;
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(50, 150);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const lifespan = Utils.random(0.5, 1);
            const size = Utils.random(2, 5);
            const color = 'rgba(255, 165, 0, 1)';

            this.particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                velocityX,
                velocityY,
                lifespan,
                size,
                color
            ));
        }
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;

        for (const piece of this.pieces) {
            ctx.save();
            ctx.globalAlpha = piece.opacity;
            ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);

            ctx.rotate(piece.rotation);

            ctx.scale(piece.scale, piece.scale);

            graphicEngine.ctx.drawImage(
                this.image,
                piece.sourceX,
                piece.sourceY,
                piece.sourceWidth,
                piece.sourceHeight,
                -piece.width,
                -piece.height,
                piece.width,
                piece.height
            );

            ctx.restore();
        }

        graphicEngine.ctx.globalCompositeOperation = 'lighter';
        for (const particle of this.particles) {
            particle.render(ctx);
        }
        graphicEngine.ctx.globalCompositeOperation = 'source-over';

    }

    easeOutQuad(t) {
        return t * (2 - t);
    }
}
