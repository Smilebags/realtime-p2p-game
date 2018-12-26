// todo: Add player colours and scoreboard
// todo: Add easier way to join game (create join link on game host)
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
            let serverId = yield makeServer();
            if (serverIdEl) {
                serverIdEl.innerHTML = `Game ID: ${serverId}`;
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
        // @ts-ignore
        let peer = new Peer();
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
function makeServer() {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer = new Peer();
        let canvas = document.querySelector("canvas");
        // canvas.width = 1000;
        // canvas.height = 1000;
        let server = new GameServer(canvas, worldSize, 1000);
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
                server.handleMessage(data, conn);
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
