var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameServer } from "./gameServer.js";
import { Player } from "./player.js";
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
                player.handleMessage(data);
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
            addInteractionEvents([upEl, leftEl, downEl, rightEl], player);
            resolve();
        });
    });
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
function addInteractionEvents(elements, player) {
    let dirArr = ["up", "left", "down", "right"];
    elements.forEach((element, index) => {
        if (element) {
            element.addEventListener("touchstart", (e) => {
                console.log(`Touchstart: ${dirArr[index]}`);
                e.preventDefault();
                e.stopPropagation();
                player.move(dirArr[index]);
            });
        }
    });
}
