import {
    IPeerMessage
} from "./types";
import { Player } from "./player.js";

export class GameServer {
    playerList: Player[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement) {
        this.playerList = [];
        this.canvas = canvas;
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
        this.render();
    }
    addPlayer(name: string): void {
        this.playerList.push(new Player({
            name,
            location: "host",
            canvasContext: this.context
        }));
    }
    findPlayerByName(name: string): Player | null {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }

    render(): void {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.playerList.forEach((player) => {
            player.render();
        });

        requestAnimationFrame(() => {
            this.render();
        });
    }

    handleMessage(message: IPeerMessage): void {
        switch (message.type) {
            case "registerPlayer":
                this.addPlayer(message.data.name);
                break;
            case "playerData":
                let player: Player | null = this.findPlayerByName(message.data.name);
                if (player) {
                    player.setPos(message.data.x, message.data.y);
                }
                break;
            default:
                break;
        }
        console.log(message);
    }
}