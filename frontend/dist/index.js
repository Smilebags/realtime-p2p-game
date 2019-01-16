var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameServer } from "./gameServer.js";
import { ClientPlayer } from "./player.js";
import { generateID } from "./util.js";
const worldSize = 30;
document.addEventListener("DOMContentLoaded", () => {
    let connectEl = document.querySelector(".connect");
    let serverEl = document.querySelector(".server");
    let playerEl = document.querySelector(".player");
    let serverIdEl = document.querySelector(".serverId");
    if (serverEl) {
        serverEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            // set up server Peer and display ID
            document.documentElement.classList.add("role-server");
            const peer = new Peer(generateID());
            const canvas = document.querySelector("canvas");
            const scoreboard = document.querySelector(".scoreboard");
            const server = yield makeGameServer(canvas, peer, scoreboard);
            if (serverIdEl) {
                serverIdEl.innerHTML = `Game ID: ${server.id}`;
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
            let name = (document.querySelector(".player-name")).value;
            if (id.length && name.length) {
                yield joinGame(id);
                document.documentElement.classList.add("game-connected");
            }
            else {
                // tell the user they need to enter both name and game ID
            }
        }));
    }
});
function joinGame(id) {
    return new Promise((resolve, reject) => {
        let peer = new Peer(generateID(16));
        let conn = peer.connect(id);
        conn.on("open", () => __awaiter(this, void 0, void 0, function* () {
            let upEl = document.querySelector(".up");
            let leftEl = document.querySelector(".left");
            let downEl = document.querySelector(".down");
            let rightEl = document.querySelector(".right");
            let nameEl = document.querySelector(".name");
            let scoreEl = document.querySelector(".score");
            let colourEl = document.querySelector(".colour");
            if (upEl && leftEl && downEl && rightEl && nameEl && scoreEl && colourEl) {
                let player = new ClientPlayer({
                    name: document.querySelector(".player-name").value,
                    connection: conn,
                    buttonElements: [upEl, leftEl, downEl, rightEl],
                    nameEl,
                    scoreEl,
                    colourEl,
                });
                resolve();
            }
            else {
                // couldn't find button elements
                reject();
            }
        }));
    });
}
function makeGameServer(canvas, peer, scoreboardEl) {
    return new Promise((resolve, reject) => {
        const server = new GameServer(canvas, worldSize, 1000, peer.id, scoreboardEl);
        peer.on("open", function (id) {
            resolve(server);
            console.log("ID: " + id);
        });
        peer.on("error", function (err) {
            if (err.type === "unavailable-id") {
                reject(err);
            }
            else {
                alert(err);
                reject(err);
            }
        });
        peer.on("disconnected", () => {
            alert("Connection has been lost.");
            peer.reconnect();
        });
        peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                server.handleMessage(data, conn);
            });
            let i = 0;
            setInterval(() => {
                conn.send({ type: "ping", data: i++ });
            }, 1000);
        });
    });
}
