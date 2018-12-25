export class Player {
    constructor(options = {
            name: "",
            location: "unset",
        }) {
        const defaults = {
            name: "",
            location: "unset"
        };
        options = Object.assign({}, defaults, options);
        this.x = 100;
        this.y = 100;
        this.name = options.name;
        this.location = options.location;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
    }
    render() {
        if (this.ctx) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#000000";
            this.ctx.rect(this.x, this.y, 10, 10);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    update() {
        if (this.location === "client") {
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
    move(direction) {
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
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    handleMessage(message) {
        console.log(message);
    }
}
