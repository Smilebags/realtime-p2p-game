import { HostPlayer } from "./player.js";
import { Food } from "./entities.js";
import { hslToHex } from "./util.js";
export class GameServer {
    constructor(canvas, worldSize, canvasSize, id) {
        this.id = id;
        this.playerList = [];
        this.entityList = [];
        this.canvas = canvas;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        this.worldSize = worldSize;
        this.context = canvas.getContext("2d");
        this.context.scale(canvasSize / worldSize, canvasSize / worldSize);
        this.gametickSpeed = 500;
        this.tickCount = 0;
        this.gametick();
        setInterval(() => {
            this.gametick();
        }, this.gametickSpeed);
        this.render();
    }
    addPlayer(name, connection) {
        let newPlayer = new HostPlayer({
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
    findPlayerByName(name) {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    handleMessage(message, connection) {
        switch (message.type) {
            case "registerPlayer":
                this.addPlayer(message.data.name, connection);
                break;
            case "playerData":
                let player = this.findPlayerByName(message.data.name);
                if (player) {
                    player.facing = message.data.facing;
                }
                break;
            default:
                break;
        }
    }
    gametick() {
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
                if (player.x === tailItem.x && player.y === tailItem.y) {
                    // player is on top of their tail
                    // get the index of the tail from the end
                    let index = player.tail.indexOf(tailItem);
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
                if (player1 !== player2) {
                    // comparing two different players
                    player2.tail.forEach((tailItem) => {
                        if (player1.x === tailItem.x && player1.y === tailItem.y) {
                            // player1's head is on this item of player2's tail
                            let index = player2.tail.indexOf(tailItem);
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
        if (this.tickCount % 10 === 0) {
            this.entityList.push(new Food({
                x: Math.floor(Math.random() * (this.worldSize + 1)),
                y: Math.floor(Math.random() * (this.worldSize + 1)),
                ctx: this.context
            }));
        }
        this.tickCount++;
    }
}
function makePlayerColour(str) {
    // generate a large random ish number based on the input string
    let strSum = 1;
    Array(str).forEach((letter) => {
        strSum *= letter.charCodeAt(0);
        strSum = strSum % 10000;
    });
    let brightness = (Math.random() * 50) + 25;
    return hslToHex(strSum % 360, 50, brightness);
}
