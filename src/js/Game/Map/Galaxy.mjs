export class Galaxy {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.numStars = 400;
        this.galaxyRadius = 1000;
        this.width = this.galaxyRadius;
        this.height = this.galaxyRadius;
        this.stars = [];

        console.log(`Galaxy has been found ${this.x} / ${this.y}`)

        return this;
    }

    setNumStars(stars) {
        this.numStars = stars;

        this.generateStars();

        return this;
    }

    setGalaxyRadius(radius) {
        this.galaxyRadius = radius;
        this.width = this.galaxyRadius;
        this.height = this.galaxyRadius;

        return this;
    }

    generateStars() {
        this.stars = [];

        for (let i = 0; i < this.numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.galaxyRadius;
            const size = Math.random() * 2 + 0.5;
            const color = this.generateRandomColor();
            this.stars.push({ angle, distance, size, color });
        }
    }

    update() {
        this.stars.forEach(star => {
            star.angle += 0.001 * (1 - star.distance / this.galaxyRadius);
        });
    }

    render(graphicEngine) {
        graphicEngine.ctx.save();
        graphicEngine.ctx.translate(this.x, this.y);
        graphicEngine.ctx.rotate((Math.PI / 180) * 30);

        this.stars.forEach((star) => {
            const perspective = star.distance / this.galaxyRadius;
            const x = star.distance * Math.cos(star.angle) * (1 + perspective);
            const y = star.distance * Math.sin(star.angle) * (1 - perspective);
            const size = star.size * (1 - perspective * 0.7);

            graphicEngine.ctx.beginPath();
            graphicEngine.ctx.arc(x, y, size, 0, Math.PI * 2);
            graphicEngine.ctx.fillStyle = star.color;
            graphicEngine.ctx.fill();
            graphicEngine.ctx.closePath();
        });

        graphicEngine.ctx.restore();
    }

    generateRandomColor() {
        const starColors = [
            '#FFFFFF', // White stars
            '#FFD700', // Yellow stars
            '#FFFAF0', // Soft white stars
            '#B0E0E6', // Pale blue stars
            '#FFA07A', // Light orange stars
            '#FFE4B5', // Light yellow stars
            '#87CEFA', // Soft blue stars
            '#F0E68C', // Khaki stars (pale yellow)
        ];

        const randomIndex = Math.floor(Math.random() * starColors.length);
        return starColors[randomIndex];
    }
}