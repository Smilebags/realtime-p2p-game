import {
    ErrorWithType,
    IPeerMessage,
} from "./types";

import { GameServer } from "./gameServer.js";
import { ClientPlayer } from "./player.js";
import { generateID } from "./util.js";

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
    return new Promise((resolve, reject) => {
        let peer: PeerJs.Peer = new Peer(generateID(16));

        let conn: PeerJs.DataConnection = peer.connect(id);


        conn.on("open", async () => {

            let upEl: HTMLDivElement | null = document.querySelector(".up");
            let leftEl: HTMLDivElement | null = document.querySelector(".left");
            let downEl: HTMLDivElement | null = document.querySelector(".down");
            let rightEl: HTMLDivElement | null = document.querySelector(".right");

            let nameEl: HTMLDivElement | null = document.querySelector(".name");
            let scoreEl: HTMLDivElement | null = document.querySelector(".score");
            let colourEl: HTMLDivElement | null = document.querySelector(".colour");
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

    const peer: PeerJs.Peer = new Peer(generateID());
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
    const scoreboardEl: HTMLOListElement = <HTMLOListElement>document.querySelector(".scoreboard");
    let serverIdEl: HTMLElement = <HTMLElement>document.querySelector(".serverId");


    let server: GameServer = await new Promise((resolve, reject) => {
        const server: GameServer = new GameServer(canvas, worldSize, 1000, peer.id, scoreboardEl);

        peer.on("open", function (id: string): void {
            resolve(server);
            console.log("ID: " + id);
        });

        peer.on("error", function (err:ErrorWithType): void {
            if (err.type === "unavailable-id") {
                reject(err);
            } else {
                alert(err);
                reject(err);
            }
        });

        peer.on("disconnected", () => {
            alert("Connection has been lost.");
            peer.reconnect();
        });

        peer.on("connection", (conn: PeerJs.DataConnection) => {
            conn.on("data", (data: IPeerMessage) => {
                server.handleMessage(data, conn);
            });
            let i: number = 0;
            setInterval(() => {
                conn.send({type:"ping", data:i++});
            }, 1000);
        });
    });
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
}

function setPage(pageName: string): void {
    document.documentElement.setAttribute("data-page", pageName);
}