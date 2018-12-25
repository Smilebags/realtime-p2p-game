import { Player } from "./player.js";
export class GameServer {
    constructor(canvas) {
        this.playerList = [];
        this.canvas = canvas;
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.context = canvas.getContext("2d");
        this.render();
    }
    addPlayer(name) {
        this.playerList.push(new Player({
            name,
            location: "host",
            canvasContext: this.context
        }));
    }
    findPlayerByName(name) {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.playerList.forEach((player) => {
            player.render();
        });
        requestAnimationFrame(() => {
            this.render();
        });
    }
    handleMessage(message) {
        switch (message.type) {
            case "registerPlayer":
                this.addPlayer(message.data.name);
                break;
            case "playerData":
                let player = this.findPlayerByName(message.data.name);
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
