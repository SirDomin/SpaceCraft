import {Enemy} from "./Enemy.mjs";
import {GameObject} from "./GameObject.mjs";
import {EntityTypes} from "./EntityTypes.mjs";
import {Utils} from "../../Utils/Utils.mjs";
import {EventType} from "../../Event/EventType.mjs";
import {AsteroidFragment} from "./AsteroidFragment.mjs";
import {Particle} from "./Particle.mjs";
import {ExplosionEffect} from "../Effect/ExplosionEffect.mjs";
import {Hitmark} from "./Hitmark.mjs";

export class Asteroid extends GameObject {
    constructor(x, y) {
        super(x, y, 0, 0);

        this.radius = 200;
        this.numVertices = 20;

        this.vertices = [];
        this.angle = 0;
        this.rotationSpeed = Utils.randomFloat(0, 0.1);

        this.targetImage = loader.getMediaFile('targetmark');
        this.isTarget = false;

        this.width = 0;
        this.height = 0;

        this.image = loader.getMediaFile('texture');

        this.type=EntityTypes.ENEMY;

        this.alwaysVisible = true;

        this.health = 5;
        this.minSize = 30;

        this.generateVertices();
    }

    renderTarget(graphicEngine) {
        graphicEngine.ctx.globalAlpha = 0.1;
        graphicEngine.ctx.drawImage(this.targetImage, this.x - this.radius / 2, this.y - this.radius / 2, 100, 100);
        graphicEngine.ctx.globalAlpha = 1.0;
    }

    generateVertices() {
        this.vertices = [];
        const angleBetweenVertices = (Math.PI * 2) / this.numVertices;

        for (let i = 0; i < this.numVertices; i++) {
            const angleOffset = (Math.random() - 0.2) * angleBetweenVertices * 0.1;
            const angle = i * angleBetweenVertices + angleOffset;

            const variation = (Math.random() * 0.2) + 0.9;
            const r = this.radius * variation;

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            this.vertices.push({ x, y });
        }
    }


    update(deltaTime) {
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

        ctx.clip();

        ctx.drawImage(
            this.image,
            -this.radius,
            -this.radius,
            this.radius * 2.5,
            this.radius * 2.5,
        );

        ctx.restore();


        if (window.renderCollisions === true) {
            eventHandler.dispatchEvent(EventType.RENDER_COLLISION, this.getVertices());
        }
    }

    onCollision(object) {
        if (object.damage <= 1) {
            return;
        }

        object.damage = 0;

        this.createFragment(object);

        this.createHitEffect(object.x, object.y);

        this.shrinkAsteroid();

        this.health--;
        if (this.health <= 0 || this.radius <= this.minSize) {
            this.breakApart();
        }
    }

    createFragment(object) {
        const randomVertexIndex = Math.floor(Math.random() * this.vertices.length);
        const randomVertex = this.vertices[randomVertexIndex];

        const fragment = new AsteroidFragment(this.x + randomVertex.x, this.y + randomVertex.y, this.radius / 4);

        const directionX = randomVertex.x - this.x;
        const directionY = randomVertex.y - this.y;

        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        fragment.velocityX = (directionX / magnitude) * 50;
        fragment.velocityY = (directionY / magnitude) * 50;

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, fragment);
    }

    shrinkAsteroid() {
        const shrinkFactor = 0.85;
        this.radius *= shrinkFactor;

        this.vertices = this.vertices.map(vertex => {
            return {
                x: vertex.x * shrinkFactor,
                y: vertex.y * shrinkFactor
            };
        });
    }

    createHitEffect(x, y) {
        const hitmark = new Hitmark(x, y, 5, 10, this.radius / 4, 40, 0.2);

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, hitmark);
    }

    breakApart() {
        eventHandler.dispatchEvent(EventType.REMOVE_OBJECT, this);

        this.createExplosion();
    }


    createExplosion() {
        const explosionEffect = new ExplosionEffect(this.x, this.y, this.radius / 4, 100, 40);

        eventHandler.dispatchEvent(EventType.OBJECT_CREATED, explosionEffect);
    }

    applyStatusEffect() {

    }

    checkCollision(object) {
        const thisVertices = this.getVertices();
        const otherVertices = object.getVertices();

        return this.checkSAT(thisVertices, otherVertices);
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

}