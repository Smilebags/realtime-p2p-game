import addShortcut from "./shortcut.js";
export class Player {
    constructor(options = {}) {
        this.x = 0;
        this.y = 0;
        this.name = options.name;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
        this.worldSize = options.worldSize;
        this.size = 1;
        this.tail = [];
        this.facing = "down";
        this.tailLength = 0;
        this.colour = options.colour || "#000000";
        this.connection.send({
            type: "playerInfo",
            data: {
                score: this.tailLength,
                name: this.name,
                colour: this.colour,
            }
        });
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
            this.ctx.fillStyle = this.colour;
            this.ctx.rect(this.x, this.y, this.size, this.size);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    update() {
        this.connection.send({
            type: "playerInfo",
            data: {
                score: this.tailLength
            }
        });
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
        return successful;
    }
    makeFacing(direction) {
        this.facing = direction;
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    addPoint(points = 1) {
        this.tailLength = Math.max(this.tailLength + points, 0);
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
        this.update();
    }
    handleMessage(message) {
        console.log(message);
    }
}
export class ClientPlayer {
    constructor(options = {}) {
        let { name, connection, buttonElements, nameEl, scoreEl, colourEl, } = options;
        this.name = name;
        this.connection = connection;
        this.buttonElements = buttonElements;
        this.addInteractionEvents(buttonElements);
        this.nameEl = nameEl;
        this.scoreEl = scoreEl;
        this.colourEl = colourEl;
        this.score = 0;
        this.colour = "#000000";
        this.nameEl.innerText = name;
        this.colourEl.style.backgroundColor = this.colour;
        this.setScore(0);
        connection.on("data", (data) => {
            this.handleMessage(data);
        });
        connection.send({
            type: "registerPlayer",
            data: {
                name: this.name
            }
        });
    }
    handleMessage(message) {
        switch (message.type) {
            case "playerInfo":
                // set score, name and colour
                if (message.data.score) {
                    this.setScore(message.data.score);
                }
                if (message.data.colour) {
                    this.colour = message.data.colour;
                    this.colourEl.style.backgroundColor = this.colour;
                }
                if (message.data.name) {
                    this.name = message.data.name;
                    this.nameEl.innerText = this.name;
                }
                break;
            default:
                console.log(message);
                break;
        }
    }
    makeFacing(dir) {
        this.connection.send({
            type: "playerData",
            data: {
                name: this.name,
                facing: dir
            }
        });
    }
    setScore(score) {
        this.score = score;
        this.scoreEl.innerText = String(this.score);
    }
    addInteractionEvents(elements) {
        let dirArr = ["up", "left", "down", "right"];
        let hotkeyArr = ["w", "a", "s", "d"];
        elements.forEach((element, index) => {
            if (element) {
                element.addEventListener("touchstart", (e) => {
                    console.log(`Touchstart: ${dirArr[index]}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.makeFacing(dirArr[index]);
                });
            }
            addShortcut({
                hotkey: hotkeyArr[index],
                callback: () => {
                    console.log(`Making facing ${dirArr[index]}`);
                    this.makeFacing(dirArr[index]);
                }
            });
        });
    }
}
function clamp(val, min, max) {
    return Math.min(max, Math.max(val, min));
}
function boundedBy(val, min, max) {
    // include lower bound exclude upper bound
    return val >= min && val < max;
}
