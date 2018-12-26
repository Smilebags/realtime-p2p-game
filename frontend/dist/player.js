export class Player {
    constructor(options = {
            name: "",
            location: "unset",
            worldSize: 30
        }) {
        const defaults = {
            name: "",
            location: "unset",
            worldSize: 30
        };
        options = Object.assign({}, defaults, options);
        this.x = 0;
        this.y = 0;
        this.name = options.name;
        this.location = options.location;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
        this.worldSize = options.worldSize;
        this.size = 1;
        this.tail = [];
        this.facing = "down";
        this.tailLength = 0;
    }
    render() {
        if (this.ctx) {
            // draw the tail
            if (this.tailLength > 0) {
                this.ctx.beginPath();
                this.ctx.fillStyle = "#333333";
                this.tail.forEach((tailItem) => {
                    if (this.ctx) {
                        this.ctx.rect(tailItem.x, tailItem.y, this.size, this.size);
                    }
                });
                this.ctx.fill();
                this.ctx.closePath();
            }
            // draw the head
            this.ctx.beginPath();
            this.ctx.fillStyle = "#000000";
            this.ctx.rect(this.x, this.y, this.size, this.size);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    update() {
        if (this.location === "client") {
            this.connection.send({
                type: "playerData",
                data: {
                    // x: this.x,
                    // y: this.y,
                    name: this.name,
                    facing: this.facing
                }
            });
        }
    }
    walk() {
        switch (this.facing) {
            case "up":
                this.y -= this.size;
                break;
            case "down":
                this.y += this.size;
                break;
            case "left":
                this.x -= this.size;
                break;
            case "right":
                this.x += this.size;
                break;
            default:
                break;
        }
        let successful = boundedBy(this.x, 0, this.worldSize) && boundedBy(this.y, 0, this.worldSize);
        this.x = clamp(this.x, 0, this.worldSize - this.size);
        this.y = clamp(this.y, 0, this.worldSize - this.size);
        this.update();
        return successful;
    }
    makeFacing(direction) {
        this.facing = direction;
        this.update();
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    addPoint(points = 1) {
        this.tailLength += points;
        // potentially use this to track the points of each player
    }
    gametick() {
        let oldX = this.x;
        let oldY = this.y;
        // move the head forward if possible
        let walked = this.walk();
        if (walked) {
            // add a new tail at the old head location
            this.tail.push({ x: oldX, y: oldY });
        }
        // clip the tail (from 0) if it is longer than it should be
        while (this.tail.length > this.tailLength && this.tail.length !== 0) {
            this.tail.shift();
        }
        // remove the last tail position if the walk was unsuccessful
        if (!walked) {
            this.tail.shift();
            this.addPoint(-1);
        }
    }
    handleMessage(message) {
        console.log(message);
    }
}
function clamp(val, min, max) {
    return Math.min(max, Math.max(val, min));
}
function boundedBy(val, min, max) {
    // include lower bound exclude upper bound
    console.log(`val ${val} is between ${min} and ${max}`);
    return val >= min && val < max;
}
