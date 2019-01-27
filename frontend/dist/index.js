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
import { generateId } from "./util.js";
const worldSize = 30;
document.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
    // join game quickly if the game query is present
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("game");
    if (gameId) {
        // get player name
        let playerName = yield getPlayerName();
        // join game
        yield joinGame(gameId, playerName);
        setPage("controller");
    }
    let serverEl = document.querySelector(".server");
    let playerEl = document.querySelector(".player");
    serverEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        yield makeGameServer();
        setPage("host");
    }));
    playerEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        // get game ID
        let gameId = yield getGameId();
        // get player name
        let playerName = yield getPlayerName();
        // join game
        yield joinGame(gameId, playerName);
        setPage("controller");
    }));
}));
function joinGame(id, name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let peer = new Peer(generateId(16));
            let conn = peer.connect(id);
            let upEl = document.querySelector(".up");
            let leftEl = document.querySelector(".left");
            let downEl = document.querySelector(".down");
            let rightEl = document.querySelector(".right");
            let nameEl = document.querySelector(".name");
            let scoreEl = document.querySelector(".score");
            let colourEl = document.querySelector(".colour");
            conn.on("open", () => __awaiter(this, void 0, void 0, function* () {
                if (upEl && leftEl && downEl && rightEl && nameEl && scoreEl && colourEl) {
                    let player = new ClientPlayer({
                        name: name,
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
            conn.on("error", (err) => {
                reject(err);
            });
        });
    });
}
function getPlayerName() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // transition page to page-get-name
            setPage("get-name");
            let joinEl = document.querySelector(".page-get-name .join");
            joinEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                let name = (document.querySelector(".page-get-name .player-name")).value;
                // if it is valid, return the value, otherwise show a suitable error to user
                if (name.length) {
                    resolve(name);
                }
                else {
                    // tell the user they need to enter a name
                }
            }));
        });
    });
}
function getGameId() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // transition page to page-get-id
            setPage("get-id");
            let connectEl = document.querySelector(".page-get-id .connect");
            // wait for click on connect
            // if it is valid, return the value, otherwise show a suitable error to user
            connectEl.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                let id = (document.querySelector(".page-get-id .id")).value;
                if (id.length) {
                    resolve(id);
                }
                else {
                    // tell the user they need to enter a game ID
                }
            }));
        });
    });
}
function makeGameServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // set up server Peer and display ID
        setPage("host");
        const canvas = document.querySelector("canvas");
        const scoreboardEl = document.querySelector(".scoreboard");
        const serverIdEl = document.querySelector(".serverId");
        // await the creation and connection of the server
        // so that the function doesn't return until the server is ready
        const server = new GameServer(canvas, worldSize, 1000, scoreboardEl);
        yield server.ready();
        if (serverIdEl) {
            serverIdEl.innerHTML = `Game ID: ${server.id}`;
        }
        let shareLinkEl = document.querySelector(".sharelink");
        if (shareLinkEl) {
            const shareLink = document.createElement("a");
            shareLink.href = location.href + "?game=" + server.id;
            shareLink.innerText = location.href + "?game=" + server.id;
            shareLinkEl.appendChild(shareLink);
        }
        const pauseEl = document.querySelector(".pause");
        pauseEl.addEventListener("click", (clickEvent) => {
            server.togglePause();
            if (pauseEl.innerText === "Pause") {
                pauseEl.innerText = "Resume";
            }
            else {
                pauseEl.innerText = "Pause";
            }
        });
    });
}
function setPage(pageName) {
    document.documentElement.setAttribute("data-page", pageName);
}
