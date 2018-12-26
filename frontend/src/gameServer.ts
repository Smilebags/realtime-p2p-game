import {
    IPeerMessage, IConnection
} from "./types";
import { Player } from "./player.js";
import { Entity } from "./entities.js";

export class GameServer {
    playerList: Player[];
    entityList: Entity[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    worldSize: number;
    gametickSpeed: number;
    tickCount: number;
    constructor(canvas: HTMLCanvasElement, worldSize: number, canvasSize: number) {
        this.playerList = [];
        this.entityList = [];
        this.canvas = canvas;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;

        this.worldSize = worldSize;
        this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
        this.context.scale(canvasSize / worldSize, canvasSize / worldSize);
        this.gametickSpeed = 500;
        this.tickCount = 0;
        this.gametick();
        setInterval(() => {
            this.gametick();
        }, this.gametickSpeed);
        this.render();
    }

    addPlayer(name: string, connection: IConnection): Player {
        let newPlayer: Player = new Player({
            name,
            location: "host",
            canvasContext: this.context,
            worldSize: this.worldSize,
            colour: makePlayerColour(name),
            connection
        });
        this.playerList.push(newPlayer);
        return newPlayer;
    }

    findPlayerByName(name: string): Player | null {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }

    render(): void {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.entityList.forEach((entity) => {
            entity.render();
        });
        this.playerList.forEach((player) => {
            player.render();
        });

        requestAnimationFrame(() => {
            this.render();
        });
    }

    handleMessage(message: IPeerMessage, connection: IConnection): void {
        switch (message.type) {
            case "registerPlayer":
                let newPlayer: Player = this.addPlayer(message.data.name, connection);
                break;
            case "playerData":
                let player: Player | null = this.findPlayerByName(message.data.name);
                if (player) {
                    // player.setPos(message.data.x, message.data.y);
                    player.facing = message.data.facing;
                }
                break;
            default:
                break;
        }
        console.log(message);
    }

    gametick(): void {
        // gametick all players
        this.playerList.forEach((player) => {
            player.gametick();
        });

        // check if any players have eaten food
        this.playerList.forEach((player) => {
            this.entityList.forEach((entity, index) => {
                if (player.x === entity.x && player.y === entity.y) {
                    this.entityList.splice(index, 1);
                    player.addPoint();
                }
            });
        });

        // check if any players have collided with their own tail
        this.playerList.forEach((player) => {
            player.tail.forEach((tailItem) => {
                if(player.x === tailItem.x && player.y === tailItem.y) {
                    // player is on top of their tail
                    // get the index of the tail from the end
                    let index: number = player.tail.indexOf(tailItem);
                    index += 1;
                    // add one since the array index starts from 0
                    // and we don't want to take 0 points if on the last item
                    player.addPoint(index * -1);
                }
            });
        });

        // check if any players have collided with other tails
        this.playerList.forEach((player1) => {
            this.playerList.forEach((player2) => {
                if(player1 !== player2) {
                    // comparing two different players
                    player2.tail.forEach((tailItem) => {
                    if(player1.x === tailItem.x && player1.y === tailItem.y) {
                        // player1's head is on this item of player2's tail
                        let index: number = player2.tail.indexOf(tailItem);
                        // add one since the array index starts from 0
                        // and we don't want to take 0 points if on the last item
                        index += 1;

                        // give the tail from player2 to player1
                        player1.addPoint(index);
                        player2.addPoint(index * -1);
                    }
                    });
                }
            });
        });

        // add more food
        if(this.tickCount % 10 === 0) {
            this.entityList.push(new Entity({
                x: Math.floor(Math.random() * (this.worldSize + 1)),
                y: Math.floor(Math.random() * (this.worldSize + 1)),
                ctx: this.context
            }));
        }

        this.tickCount++;
    }
}

function makePlayerColour(str: string): string {
    // generate a large random ish number based on the input string
    let strSum: number = 1;
    Array(str).forEach((letter: string) => {
        strSum *= letter.charCodeAt(0);
        strSum = strSum % 10000;
    });
    let brightness: number = (Math.random() * 50) + 25;
    return hslToHex(strSum % 360, 50, brightness);
}

/**
 * Returns a hex string based on an HSL colour
 * @param h Hue in degrees
 * @param s Saturation percent
 * @param l Luminance percent
 */
function hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb:((p: number, q: number, t: number) => number) = (p: number, q: number, t: number) => {
        if(t < 0) {
            t += 1;
        }
        if(t > 1) {
            t -= 1;
        }
        if(t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if(t < 1 / 2) {
            return q;
        }
        if(t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      };
      const q: number = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p: number = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex: (x: number) => string = (x: number) => {
      const hex: string = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }