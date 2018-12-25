import {
    DeviceLocation,
    IPlayerConstructorOptions,
    Direction,
    IPeerMessage
} from "./types";

export class Player {
    x: number;
    y: number;
    name: string;
    location: DeviceLocation;
    connection?: any;
    ctx?: CanvasRenderingContext2D;
    constructor(options: IPlayerConstructorOptions = {
        name: "",
        location: "unset",
    }) {
        const defaults: IPlayerConstructorOptions = {
            name: "",
            location: "unset"
        };
        options = {
            ...defaults,
            ...options
        };
        this.x = 100;
        this.y = 100;
        this.name = options.name;
        this.location = options.location;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
    }
    render(): void {
        if(this.ctx) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#000000";
            this.ctx.rect(this.x, this.y, 10, 10);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    private update(): void {
        if(this.location === "client") {
            this.connection.send({
                type: "playerData",
                data: {
                    x: this.x,
                    y: this.y,
                    name: this.name
                }
            });
        }
    }

    move(direction: Direction): void {
        switch (direction) {
            case "up":
                this.y -= 10;
                break;
            case "down":
                this.y += 10;
                break;
            case "left":
                this.x -= 10;
                break;
            case "right":
                this.x += 10;
                break;
            default:
                break;
        }
        this.update();
    }

    setPos(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    handleMessage(message: IPeerMessage): void {
        console.log(message);
    }
}
