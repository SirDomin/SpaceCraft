import {Resource} from "./Resource.mjs";

export class Part {
    constructor(player, x, y, width, height, color = 'yellow', resourceUsage = {}, name = '') {
        this.player = player;
        if (x < 0) {
            x = x - this.player.width;
        } else {
            x = x + width;
        }
        if (y < 0) {
            y += height + this.player.height / 2
        } else {
            y -= height
        }
        this.relativeX = x;
        this.relativeY = y;
        this.width = width;
        this.height = height;

        this.active = false;

        this.name = name;
        this.color = color;

        this.baseX = - this.player.width / 2;
        this.baseY = - this.player.height / 2;

        this.x = this.baseX - this.relativeX;
        this.y = this.baseY - this.relativeY;

        this.resourceUsage = {
            type: Resource[resourceUsage.type] || Resource.HEALTH,
            cost: resourceUsage.cost || -1,
            usage: resourceUsage.usage || 'second',
            interval: resourceUsage.interval || 5,
            currentInterval: 0,
        };

        this.lastUpdateTime = 0;
        this.timeAccumulator = 0;

        return this;
    }

    static fromJSON(player, jsonData) {
        const { x, y, width, height, color, resourceUsage, name } = jsonData;
        return new Part(
            player,
            x || 0,
            y || 0,
            width || 50,
            height || 50,
            color || 'yellow',
            resourceUsage || {},
            name || '-'
        );
    }

    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        this.timeAccumulator += deltaTime;

        if (this.timeAccumulator >= 1000) {
            this.updateSecond();
            this.timeAccumulator = 0;
        }
    }

    updateSecond() {
        if (this.active) {
            Object.entries(this.player.resources).forEach(([key, resource]) => {
                if (resource.type === this.resourceUsage.type && this.resourceUsage.usage === 'second') {
                    this.resourceUsage.currentInterval += 1;
                    if (this.resourceUsage.currentInterval >= this.resourceUsage.interval) {
                        this.resourceUsage.currentInterval = 0;

                        resource.addAmount(this.resourceUsage.cost);
                    }
                }
            });
        }
    }

    trigger() {

    }

    render(graphicEngine) {
        graphicEngine.drawSquare(this.x, this.y, this.width, this.height, this.color);

        this.renderLineToPlayer(graphicEngine);
    }

    renderLineToPlayer(graphicEngine) {
        const playerX = (this.player.width / 2) - this.player.width / 2;
        const playerY = (this.player.height / 2) - this.player.height / 2;
        const objectX = this.x + (this.width / 2);
        const objectY = this.y + (this.height / 2);

        // Set line style and color
        graphicEngine.ctx.strokeStyle = this.player.color;
        graphicEngine.ctx.lineWidth = 1;

        // Draw the line
        graphicEngine.ctx.beginPath();
        graphicEngine.ctx.moveTo(objectX, objectY);   // Start at the object
        graphicEngine.ctx.lineTo(playerX, playerY);   // Draw towards the player
        graphicEngine.ctx.stroke();                   // Render the line
    }

    getVertices() {
        const player = this.player;

        const cos = Math.cos(this.player.rotation - Math.PI / 2);
        const sin = Math.sin(this.player.rotation - Math.PI / 2);

        const x = this.player.x + this.x;

        const topLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y + this.height) * cos
        };

        const topRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y + this.height) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y +this.height ) * cos
        };

        const bottomRight = {
            x: this.player.x + player.width / 2 + (this.x) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x) * sin + (this.y) * cos
        };

        const bottomLeft = {
            x: this.player.x + player.width / 2 + (this.x + this.width) * cos - (this.y) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width) * sin + (this.y) * cos
        };

        const simple = {
            x: this.player.x + player.width / 2 + (this.x + this.width / 2) * cos - (this.y + this.height / 2) * sin,
            y: this.player.y + player.height / 2 + (this.x + this.width / 2) * sin + (this.y + this.height / 2) * cos
        }

        // return [simple];
        return [topLeft, topRight, bottomRight, bottomLeft];
    }
}