import {
    DeviceLocation,
    Direction,
    IPeerMessage,
    IPlayerInfo
} from "./types";

import addShortcut from "./shortcut.js";
import { boundedBy, clamp, Colour } from "./util.js";

interface IClientPlayerConstructorOptions {
    name: string;
    connection: PeerJs.DataConnection;
    buttonElements: HTMLElement[];
    nameEl: HTMLElement;
    scoreEl: HTMLElement;
    colourEl: HTMLElement;
}


interface IHostPlayerConstructorOptions {
    name: string;
    location: DeviceLocation;
    connection: PeerJs.DataConnection;
    canvasContext: CanvasRenderingContext2D;
    worldSize: number;
    colour: string;
}

export class HostPlayer {
    x: number;
    y: number;
    name: string;
    connection: PeerJs.DataConnection;
    ctx?: CanvasRenderingContext2D;
    worldSize: number;
    tail: {x: number, y: number}[];
    score: number;
    facing: Direction;
    colour: string;
    constructor(options: IHostPlayerConstructorOptions = <IHostPlayerConstructorOptions>{}) {
        this.x = 0;
        this.y = 0;
        this.name = options.name;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
        this.worldSize = options.worldSize;
        this.tail = [];
        this.facing = "down";
        this.score = 0;
        this.colour = options.colour || "#000000";
        this.connection.send({
            type: "playerInfo",
            data: {
                score: this.score,
                name: this.name,
                colour: this.colour,
            }
        });
    }

    tailColour(): string {
        let colour: Colour = new Colour().fromHex(this.colour);
        if(colour.luminosity >= 128) {
            colour.luminosity = colour.luminosity *= 1.1;
        } else {
            colour.luminosity = colour.luminosity /= 1.1;
        }
        return colour.hex();
    }

    render(): void {
        if(this.ctx) {
            // draw the tail
            if(this.score > 0) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.tailColour();
                console.log(this.tailColour());
                this.tail.forEach((tailItem) => {
                        if(this.ctx) {
                            this.ctx.rect(tailItem.x, tailItem.y, 1, 1);
                        }
                    });
                this.ctx.fill();
                this.ctx.closePath();
            }
            // draw the head
            this.ctx.beginPath();
            this.ctx.fillStyle = this.colour;
            this.ctx.rect(this.x, this.y, 1, 1);
            this.ctx.fill();
            this.ctx.closePath();

        }
    }
    update(): void {
        console.log(this.score);
        this.connection.send({
            type: "playerInfo",
            data: {
                score: this.score
            }
        });
    }

    walk(): boolean {
        switch (this.facing) {
            case "up":
                this.y -= 1;
                break;
            case "down":
                this.y += 1;
                break;
            case "left":
                this.x -= 1;
                break;
            case "right":
                this.x += 1;
                break;
            default:
                break;
        }

        let successful: boolean = boundedBy(this.x, 0, this.worldSize) && boundedBy(this.y, 0, this.worldSize);
        this.x = clamp(this.x, 0, this.worldSize - 1);
        this.y = clamp(this.y, 0, this.worldSize - 1);
        return successful;
    }

    makeFacing(direction: Direction): void {
        this.facing = direction;
    }

    setPos(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    addPoint(points:number = 1): void {
        this.score = Math.max(this.score + points, 0);
    }

    gametick():void {
        let oldX: number = this.x;
        let oldY: number = this.y;
        // move the head forward if possible
        let walked: boolean = this.walk();
        if(walked) {
            // add a new tail at the old head location
            this.tail.push({x: oldX, y: oldY});
        } else {
            // take off one point if failed to walk
            this.addPoint(-1);
        }
        // clip the tail (from 0) if it is longer than it should be
        while(this.tail.length > this.score) {
            this.tail.shift();
        }
        console.log(this.tail);
    }

    handleMessage(message: IPeerMessage): void {
        console.log(message);
    }
}

export class ClientPlayer {
    name: string;
    connection: PeerJs.DataConnection;
    buttonElements: HTMLElement[];
    nameEl: HTMLElement;
    scoreEl: HTMLElement;
    colourEl: HTMLElement;
    private score: number;
    colour: string;
    textColourSet: boolean;
    constructor(options: IClientPlayerConstructorOptions = <IClientPlayerConstructorOptions>{}) {
        let {
            name,
            connection,
            buttonElements,
            nameEl,
            scoreEl,
            colourEl,
        } = options;
        this.name = name;
        this.connection = connection;
        this.buttonElements = buttonElements;
        this.addInteractionEvents(buttonElements);
        this.nameEl = nameEl;
        this.scoreEl = scoreEl;
        this.colourEl = colourEl;

        this.score = 0;
        this.colour= "#000000";

        this.nameEl.innerText = name;
        this.colourEl.style.backgroundColor = this.colour;
        this.setScore(0);
        this.textColourSet = false;

        connection.on("data", (data: IPeerMessage) => {
            this.handleMessage(data);
        });
        connection.send({
            type: "registerPlayer",
            data: {
                name: this.name
            }
        });
    }

    textColour(): string {
        let playerColour: Colour = new Colour().fromHex(this.colour);
        if(playerColour.luminosity >= 128) {
            return "#000000";
        } else {
            return "#FFFFFF";
        }
    }

    handleMessage(message: IPeerMessage): void {
        switch (message.type) {
            case "playerInfo":
                // set score, name and colour
                this.handlePlayerInfoMessage(message.data);
                break;
            default:
                console.log(message);
                break;
        }
    }

    handlePlayerInfoMessage(data: IPlayerInfo): void {
        // must do this since 0 is a valid score but tests falsey
        if(data.score !== undefined) {
            this.setScore(data.score);
        }
        if(data.colour) {
            this.colour = data.colour;
            this.colourEl.style.backgroundColor = this.colour;
            if(!this.textColourSet) {
                this.nameEl.style.color = this.textColour();
                this.scoreEl.style.color = this.textColour();
                this.textColourSet = true;
            }
        }
        if(data.name) {
            this.name = data.name;
            this.nameEl.innerText = this.name;
        }
    }

    makeFacing(dir: Direction): void {
        this.connection.send({
            type: "playerData",
            data: {
                name: this.name,
                facing: dir
            }
        });
    }

    setScore(score: number): void {
        console.log(score);
        this.score = score;
        console.log(this.scoreEl.innerText);
        this.scoreEl.innerText = String(this.score);
        console.log(this.scoreEl.innerText);
    }

    addInteractionEvents(elements: HTMLElement[]): void {
        let dirArr: Direction[] = ["up", "left", "down", "right"];
        let hotkeyArr: string[] = ["w", "a", "s", "d"];
        elements.forEach((element, index) => {
            if(element) {
                element.addEventListener("touchstart", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.makeFacing(dirArr[index]);
                });
            }
            addShortcut({
                hotkey: hotkeyArr[index],
                callback: () => {
                    this.makeFacing(dirArr[index]);
                }
            });
        });
    }
}