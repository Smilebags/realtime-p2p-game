export class Food {
    x: number;
    y: number;
    ctx?: CanvasRenderingContext2D;
    constructor(options: IFoodConstructorOptions = {}) {
        let defaults: {x: number, y: number} = {
            x: 0,
            y: 0
        };
        let {x, y, ctx} = <{x: number, y: number, ctx: CanvasRenderingContext2D | null}>{
            ...defaults,
            ...options
        };
        this.x = x;
        this.y = y;
        if(ctx) {
            this.ctx = ctx;
        }
    }
    render(): void {
        if(this.ctx) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#AAAAAA";
            this.ctx.rect(this.x, this.y, 1, 1);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
}

interface IFoodConstructorOptions {
    x?: number;
    y?: number;
    ctx?: CanvasRenderingContext2D;
}