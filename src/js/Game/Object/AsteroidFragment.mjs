import {GameObject} from "./GameObject.mjs";
import {Utils} from "../../Utils/Utils.mjs";
import {EntityTypes} from "./EntityTypes.mjs";

export class AsteroidFragment extends GameObject {
    constructor(x, y, radius) {
        super(x, y, radius, radius);

        this.radius = radius;
        this.numVertices = 6;
        this.vertices = [];
        this.rotationSpeed = Utils.randomFloat(0, 1);

        // Movement properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.movementDuration = 3; // Fragment will move for 1 second
        this.movementTime = 0;

        this.angle = 0;

        this.type=EntityTypes.COLLECTIBLE;

        this.collisionObjects = [
            EntityTypes.PLAYER,
        ]

        this.generateVertices();
        this.setRandomVelocity();
    }

    onCollision(object) {
    }

    generateVertices() {
        const angleBetweenVertices = (Math.PI * 2) / this.numVertices;
        for (let i = 0; i < this.numVertices; i++) {
            const angle = i * angleBetweenVertices;
            const r = this.radius * ((Math.random() * 0.3) + 0.7);
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            this.vertices.push({ x, y });
        }
    }

    getVertices() {
        const transformedVertices = [];
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        for (const vertex of this.vertices) {
            const x = vertex.x * cos - vertex.y * sin + this.x;
            const y = vertex.x * sin + vertex.y * cos + this.y;
            transformedVertices.push({ x, y });
        }
        return transformedVertices;
    }

    setRandomVelocity() {
        const randomAngle = Utils.randomFloat(0, Math.PI * 2);
        const speed = Utils.randomFloat(10, 40);
        this.velocityX = Math.cos(randomAngle) * speed;
        this.velocityY = Math.sin(randomAngle) * speed;
    }

    update(deltaTime) {
        this.movementTime += deltaTime;

        if (this.movementTime < this.movementDuration) {
            this.x += this.velocityX * deltaTime;
            this.y += this.velocityY * deltaTime;

            this.velocityX *= 0.99;
            this.velocityY *= 0.99;
        }

        this.angle += this.rotationSpeed * deltaTime;
    }

    render(graphicEngine) {
        const ctx = graphicEngine.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.restore();
    }

    checkCollision(object) {
        const thisVertices = this.getVertices();
        const otherVertices = object.getVertices();

        return this.checkSAT(thisVertices, otherVertices);
    }
}