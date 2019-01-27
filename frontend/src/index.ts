import {
    ErrorWithType,
    IPeerMessage,
} from "./types";

import { GameServer } from "./gameServer.js";
import { ClientPlayer } from "./player.js";
import { generateId } from "./util.js";
import { constants } from "http2";

const worldSize: number = 30;

document.addEventListener("DOMContentLoaded", async () => {
    // join game quickly if the game query is present
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const gameId: string | null = urlParams.get("game");
    if(gameId) {
        // get player name
        let playerName: string = await getPlayerName();
        // join game
        await joinGame(gameId, playerName);
        setPage("controller");
    }
    let serverEl: HTMLElement = <HTMLElement>document.querySelector(".server");
    let playerEl: HTMLElement = <HTMLElement>document.querySelector(".player");

    serverEl.addEventListener("click", async () => {
        await makeGameServer();
        setPage("host");
    });
    playerEl.addEventListener("click", async () => {
        // get game ID
        let gameId: string = await getGameId();
        // get player name
        let playerName: string = await getPlayerName();
        // join game
        await joinGame(gameId, playerName);
        setPage("controller");
    });
});

async function joinGame(id: string, name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let peer: PeerJs.Peer = new Peer(generateId(16), {secure: location.protocol === "https"});

        let conn: PeerJs.DataConnection = peer.connect(id);

        let upEl: HTMLDivElement | null = document.querySelector(".up");
        let leftEl: HTMLDivElement | null = document.querySelector(".left");
        let downEl: HTMLDivElement | null = document.querySelector(".down");
        let rightEl: HTMLDivElement | null = document.querySelector(".right");

        let nameEl: HTMLDivElement | null = document.querySelector(".name");
        let scoreEl: HTMLDivElement | null = document.querySelector(".score");
        let colourEl: HTMLDivElement | null = document.querySelector(".colour");

        conn.on("open", async () => {

            if(upEl && leftEl && downEl && rightEl && nameEl && scoreEl && colourEl) {
                let player: ClientPlayer = new ClientPlayer({
                    name: name,
                    connection: conn,
                    buttonElements: [upEl, leftEl, downEl, rightEl],
                    nameEl,
                    scoreEl,
                    colourEl,
                });
                resolve();
            } else {
                // couldn't find button elements
                reject();
            }
        });
        conn.on("error", (err) => {
            reject(err);
        });
    });
}

async function getPlayerName(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // transition page to page-get-name
        setPage("get-name");
        let joinEl: HTMLElement = <HTMLElement>document.querySelector(".page-get-name .join");
        joinEl.addEventListener("click", async () => {
            let name: string = (<HTMLInputElement>(document.querySelector(".page-get-name .player-name"))).value;
            // if it is valid, return the value, otherwise show a suitable error to user
            if(name.length) {
                resolve(name);
            } else {
                // tell the user they need to enter a name
            }
        });
    });
}

async function getGameId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // transition page to page-get-id
        setPage("get-id");
        let connectEl: HTMLElement = <HTMLElement>document.querySelector(".page-get-id .connect");
        // wait for click on connect
        // if it is valid, return the value, otherwise show a suitable error to user
        connectEl.addEventListener("click", async () => {
            let id: string = (<HTMLInputElement>(document.querySelector(".page-get-id .id"))).value;
            if(id.length) {
                resolve(id);
            } else {
                // tell the user they need to enter a game ID
            }
        });
    });
}

async function makeGameServer(): Promise<void> {
    // set up server Peer and display ID
    setPage("host");

    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
    const scoreboardEl: HTMLOListElement = <HTMLOListElement>document.querySelector(".scoreboard");
    const serverIdEl: HTMLElement = <HTMLElement>document.querySelector(".serverId");

    // await the creation and connection of the server
    // so that the function doesn't return until the server is ready
    const server: GameServer = new GameServer(canvas, worldSize, 1000, scoreboardEl);
    await server.ready();
    if(serverIdEl) {
        serverIdEl.innerHTML = `Game ID: ${server.id}`;
    }
    let shareLinkEl: HTMLDivElement = <HTMLDivElement>document.querySelector(".sharelink");
    if(shareLinkEl) {
        const shareLink: HTMLAnchorElement = document.createElement("a");
        shareLink.href = location.href + "?game=" + server.id;
        shareLink.innerText = location.href + "?game=" + server.id;
        shareLinkEl.appendChild(shareLink);
    }

    const pauseEl: HTMLElement = <HTMLElement>document.querySelector(".pause");
    pauseEl.addEventListener("click", (clickEvent) => {
        server.togglePause();
        if(pauseEl.innerText === "Pause") {
            pauseEl.innerText = "Resume";
        } else {
            pauseEl.innerText = "Pause";
        }
    });
}

function setPage(pageName: string): void {
    document.documentElement.setAttribute("data-page", pageName);
}