"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => {
    let role = "unset";
    let connectEl = document.querySelector(".connect");
    let serverEl = document.querySelector(".server");
    let playerEl = document.querySelector(".player");
    let serverIdEl = document.querySelector(".serverId");
    if (serverEl) {
        serverEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            // set up server Peer and display ID
            document.documentElement.classList.add("role-server");
            let serverId = yield makeServer();
            if (serverIdEl) {
                serverIdEl.innerHTML = `Server ID: ${serverId}`;
            }
        }));
    }
    if (playerEl) {
        playerEl.addEventListener("click", () => {
            // show UI to join a game by ID
            document.documentElement.classList.add("role-player");
        });
    }
    if (connectEl) {
        connectEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            let id = (document.querySelector(".id")).value;
            yield joinGame(id);
            document.documentElement.classList.add("game-connected");
        }));
    }
});
function joinGame(id) {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer = new Peer();
        let conn = peer.connect(id);
        let player = new Player({
            name: document.querySelector(".player-name").value,
            location: "client",
            connection: conn
        });
        conn.on("open", () => {
            conn.on("data", (data) => {
                playerDataHandler(data);
            });
            conn.send({
                type: "registerPlayer",
                data: {
                    name: player.name
                }
            });
            let upEl = document.querySelector(".up");
            let leftEl = document.querySelector(".left");
            let downEl = document.querySelector(".down");
            let rightEl = document.querySelector(".right");
            if (upEl) {
                upEl.addEventListener("click", () => {
                    player.move("up");
                });
            }
            if (leftEl) {
                leftEl.addEventListener("click", () => {
                    player.move("left");
                });
            }
            if (downEl) {
                downEl.addEventListener("click", () => {
                    player.move("down");
                });
            }
            if (rightEl) {
                rightEl.addEventListener("click", () => {
                    player.move("right");
                });
            }
            resolve();
        });
    });
}
function playerDataHandler(data) {
    console.log(data);
}
function makeServer() {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer = new Peer();
        let canvas = document.querySelector("canvas");
        let server = new GameServer(canvas);
        peer.on("open", function (id) {
            resolve(id);
            console.log("ID: " + id);
        });
        peer.on("error", function (err) {
            if (err.type === "unavailable-id") {
                alert("" + err);
                peer.reconnect();
            }
            else {
                alert(err);
            }
        });
        peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                server.handleMessage(data);
            });
            peer.on("disconnected", () => {
                alert("Connection has been lost.");
                peer.reconnect();
            });
            let i = 0;
            setInterval(() => {
                conn.send({ type: "ping", data: i++ });
            }, 1000);
        });
    });
}
class Player {
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
}
class GameServer {
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
