export class GraphicEngine {
    container;
    canvas;
    ctx;

    constructor(container) {
        this.container = container;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth / window.gameScale;
        this.canvas.height = window.innerHeight / window.gameScale;

        this.container.appendChild(this.canvas);
        this.canvas.style.width = '100vw'
        this.canvas.style.height = '100vh'

        window.addEventListener('resize', () => {
            this.updateCanvas();
        });
    }

    updateCanvas() {
        this.canvas.width = window.innerWidth / window.gameScale;
        this.canvas.height = window.innerHeight / window.gameScale;
    }

    setAlpha(opacity) {
        this.ctx.globalAlpha = opacity;
    }

    drawImage(img, square) {

    }

    drawSquare(x, y, w, h, color = 'red') {
        this.changeColor(color);
        this.ctx.fillRect(x, y, w, h);
    }

    drawCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    setColor(color) {
        this.ctx.fillStyle = color;
    }

    roundRect(x, y, w, h, color, radii, strokeWidth = 0, strokeColor = Color.BLACK) {
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeStyle = strokeColor;
        this.changeColor(color);
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, w, h, radii);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
    }

    squareBorder(square, color = Color.GRAY, size = 0.1) {
        this.ctx.lineWidth = size;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.rect(square.x, square.y, square.w, square.h);
        this.ctx.stroke();
    }

    writeText = (text, x, y, color = this.previousColor) => {
        this.changeColor(color)
        this.ctx.fillText(text, x, y);
    }

    setFont(fontSize = this.previousFontSize, font = this.previousFont) {
        this.ctx.font = `${fontSize}px ${font}`;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    changeColor(color) {
        this.previousColor = this.ctx.fillStyle;
        this.ctx.fillStyle = color;
    }


    rotate(object, rotation) {
        this.ctx.save();

        this.ctx.translate(object.x + object.width / 2, object.y + object.height / 2);

        this.ctx.rotate(rotation);
    }

    translate(x, y) {
        this.ctx.save();

        this.ctx.translate(x, y);
    }

    restore() {
        this.ctx.restore();
    }
}