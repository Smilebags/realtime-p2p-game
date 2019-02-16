var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HostPlayer } from "./player.js";
import { Food } from "./entities.js";
import { hslToHex, generateId } from "./util.js";
export class GameServer {
    constructor(canvas, scoreboardEl, { worldSize = 40, canvasSize = 1000, foodRate = 8, tickSpeed = 250, }) {
        this.paused = true;
        this.id = generateId();
        this.playerList = [];
        this.entityList = [];
        this.canvas = canvas;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        this.scoreboard = scoreboardEl;
        this.worldSize = worldSize;
        this.context = canvas.getContext("2d");
        this.context.scale(canvasSize / worldSize, canvasSize / worldSize);
        this.gametickSpeed = tickSpeed;
        this.foodRate = foodRate;
        this.tickCount = 0;
        this.connection = new Peer(this.id, {
            secure: location.protocol === "https:",
            port: location.protocol === "https:" ? 443 : 9000
        });
        this.initialised = false;
        this.initialisedCallbacks = [];
        this.setupConnection(this.connection);
        this.gametick();
        setInterval(() => {
            this.gametick();
        }, this.gametickSpeed);
        this.render();
    }
    setOptions(options) {
        let { foodRate, tickSpeed, canvasSize } = options;
        this.foodRate = foodRate !== undefined ? foodRate : this.foodRate;
        this.gametickSpeed = tickSpeed !== undefined ? tickSpeed : this.gametickSpeed;
        if (canvasSize !== undefined) {
            this.canvas.width = canvasSize;
            this.canvas.height = canvasSize;
        }
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.initialised === true) {
                    resolve();
                }
                else {
                    this.initialisedCallbacks.push(() => {
                        resolve();
                    });
                }
            });
        });
    }
    initialisationCompleted() {
        this.initialisedCallbacks.forEach((callback) => {
            callback();
        });
    }
    setupConnection(connection) {
        connection.on("open", (id) => {
            console.log("ID: " + id);
            this.initialisationCompleted();
        });
        connection.on("error", (err) => {
            if (err.type === "unavailable-id") {
                console.log(err);
            }
            else {
                alert(err);
            }
        });
        connection.on("disconnected", () => {
            // this connection has lost connectivity to the peer server
            alert("Connection has been lost.");
            connection.reconnect();
        });
        connection.on("connection", (clientConnection) => {
            let hasRegistered = false;
            // another peer has connected to this
            clientConnection.on("data", (message) => {
                if (!hasRegistered && message.type === "registerPlayer") {
                    this.addPlayer(message.data.name, clientConnection);
                    hasRegistered = true;
                }
            });
        });
    }
    addPlayer(name, connection) {
        let rand = Math.random();
        let facing = "down";
        if (rand <= 0.25) {
            facing = "up";
        }
        else if (rand <= 0.5) {
            facing = "left";
        }
        else if (rand <= 0.75) {
            facing = "down";
        }
        else {
            facing = "right";
        }
        let newPlayer = new HostPlayer({
            name,
            location: "host",
            canvasContext: this.context,
            worldSize: this.worldSize,
            colour: makePlayerColour(name),
            connection,
            facing
        });
        newPlayer.on("disconnect", () => {
            this.removePlayer(newPlayer);
        });
        // set up ping to handle disconnections
        if (!this.playerList.length && this.paused) {
            this.paused = false;
        }
        this.playerList.push(newPlayer);
        this.updateScoreboard();
        return newPlayer;
    }
    removePlayer(player) {
        this.playerList.splice(this.playerList.indexOf(player), 1);
    }
    findPlayerByName(name) {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }
    updateScoreboard() {
        let scores = this.playerList.map((player) => {
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
            let li = document.createElement("li");
            let nameEl = document.createElement("div");
            nameEl.classList.add("scoreboard-name");
            nameEl.innerText = scoreItem.name;
            let scoreEl = document.createElement("div");
            scoreEl.classList.add("scoreboard-score");
            scoreEl.innerText = String(scoreItem.score);
            li.appendChild(nameEl);
            li.appendChild(scoreEl);
            this.scoreboard.appendChild(li);
        });
    }
    togglePause() {
        this.paused = !this.paused;
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
    gametick() {
        if (this.paused) {
            return;
        }
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
        if (this.tickCount % this.foodRate === 0) {
            this.entityList.push(new Food({
                x: Math.floor(Math.random() * (this.worldSize + 1)),
                y: Math.floor(Math.random() * (this.worldSize + 1)),
                ctx: this.context
            }));
        }
        this.updateScoreboard();
        this.playerList.forEach((player) => {
            player.update();
        });
        this.tickCount++;
    }
}
function makePlayerColour(str) {
    // generate a large random ish number based on the input string
    let strSum = 1;
    Array.from(str).forEach((letter) => {
        strSum *= letter.charCodeAt(0);
        strSum = strSum % 10000;
    });
    let brightness = (Math.random() * 50) + 25;
    return hslToHex(strSum % 360, 50, brightness);
}
