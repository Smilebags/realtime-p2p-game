import { IPeerMessage } from "./types";
import { HostPlayer } from "./player.js";
import { Food } from "./entities.js";
import { hslToHex } from "./util.js";

export class GameServer {
    id: string;
    paused: boolean;
    playerList: HostPlayer[];
    entityList: Food[];
    canvas: HTMLCanvasElement;
    scoreboard: HTMLOListElement;
    context: CanvasRenderingContext2D;
    worldSize: number;
    gametickSpeed: number;
    tickCount: number;
    constructor(canvas: HTMLCanvasElement, worldSize: number, canvasSize: number, id: string, scoreboardEl: HTMLOListElement) {
        this.paused = true;
        this.id = id;
        this.playerList = [];
        this.entityList = [];
        this.canvas = canvas;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        this.scoreboard = scoreboardEl;
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

    addPlayer(name: string, connection: PeerJs.DataConnection): HostPlayer {
        let newPlayer: HostPlayer = new HostPlayer({
            name,
            location: "host",
            canvasContext: this.context,
            worldSize: this.worldSize,
            colour: makePlayerColour(name),
            connection
        });
        if(!this.playerList.length && this.paused) {
            this.paused = false;
        }
        this.playerList.push(newPlayer);
        this.updateScoreboard();
        return newPlayer;
    }

    findPlayerByName(name: string): HostPlayer | null {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }

    updateScoreboard(): void {
        let scores: {name: string, score: number}[] = this.playerList.map((player) => {
            return {
                name: player.name,
                score: player.score
            };
        });
        scores = scores.sort((a, b) => {
            return a.score <= b.score ? 1 : -1;
        });
        this.scoreboard.innerHTML = "";
        scores.forEach((scoreItem) => {
            let li: HTMLLIElement = document.createElement("li");
            let nameEl: HTMLDivElement = document.createElement("div");
            nameEl.classList.add("scoreboard-name");
            nameEl.innerText = scoreItem.name;
            let scoreEl: HTMLDivElement = document.createElement("div");
            scoreEl.classList.add("scoreboard-score");
            scoreEl.innerText = String(scoreItem.score);

            li.appendChild(nameEl);
            li.appendChild(scoreEl);
            this.scoreboard.appendChild(li);
        });
    }

    togglePause(): void {
        this.paused = !this.paused;
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

    handleMessage(message: IPeerMessage, connection: PeerJs.DataConnection): void {
        switch (message.type) {
            case "registerPlayer":
                this.addPlayer(message.data.name, connection);
                break;
            case "playerData":
                let player: HostPlayer | null = this.findPlayerByName(message.data.name);
                if (player) {
                    player.facing = message.data.facing;
                }
                break;
            default:
                break;
        }
    }

    gametick(): void {
        if(this.paused) {
            return;
        }
        let playerScoreChanged: boolean = false;
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
                    playerScoreChanged = true;
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
                    playerScoreChanged = true;
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
                        playerScoreChanged = true;
                    }
                    });
                }
            });
        });

        // add more food
        if(this.tickCount % 10 === 0) {
            this.entityList.push(new Food({
                x: Math.floor(Math.random() * (this.worldSize + 1)),
                y: Math.floor(Math.random() * (this.worldSize + 1)),
                ctx: this.context
            }));
        }

        if(playerScoreChanged) {
            this.updateScoreboard();
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