import {GameObject} from "./GameObject.mjs";

export class Nebula extends GameObject{

    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.colors = [
            'rgba(255, 0, 255, 0.2)',   // Soft pink/purple
            'rgba(0, 255, 255, 0.2)',   // Soft cyan/blue
            'rgba(255, 165, 0, 0.2)',   // Soft orange
            'rgba(173, 216, 230, 0.2)', // Light blue
            'rgba(238, 130, 238, 0.2)', // Violet
            'rgba(144, 238, 144, 0.2)', // Light green
            'rgba(255, 182, 193, 0.2)', // Light pink
            'rgba(255, 255, 224, 0.2)', // Light yellow
            'rgba(147, 112, 219, 0.2)', // Medium purple
            'rgba(123, 104, 238, 0.2)'  // Medium slate blue
        ];

        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {

    }

    render(graphicEngine) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        const radius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;

        const nebulaGradient = graphicEngine.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        nebulaGradient.addColorStop(0, this.color);
        nebulaGradient.addColorStop(1, 'transparent');

        graphicEngine.ctx.fillStyle = nebulaGradient;
        graphicEngine.ctx.beginPath();
        graphicEngine.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        graphicEngine.ctx.fill();
    }

    renderOnMinimap(minimap, graphicEngine) {
        // graphicEngine.drawSquare(this.x * minimap.scale + minimap.x, this.y * minimap.scale + minimap.y, this.width * minimap.scale, this.height * minimap.scale, 'cyan');
    }
}