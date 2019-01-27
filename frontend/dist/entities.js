export class Food {
    constructor(options = {}) {
        let defaults = {
            x: 0,
            y: 0
        };
        let { x, y, ctx } = Object.assign({}, defaults, options);
        this.x = x;
        this.y = y;
        if (ctx) {
            this.ctx = ctx;
        }
    }
    render() {
        if (this.ctx) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#AAAAAA";
            this.ctx.rect(this.x, this.y, 1, 1);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
}
