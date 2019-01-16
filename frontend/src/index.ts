import {
    ErrorWithType,
    IPeerMessage,
} from "./types";

import { GameServer } from "./gameServer.js";
import { ClientPlayer } from "./player.js";
import { generateID } from "./util.js";

const worldSize: number = 30;

document.addEventListener("DOMContentLoaded", () => {
    let connectEl: HTMLElement | null = document.querySelector(".connect");
    let serverEl: HTMLElement | null = document.querySelector(".server");
    let playerEl: HTMLElement | null = document.querySelector(".player");
    let serverIdEl: HTMLElement | null = document.querySelector(".serverId");
    if(serverEl) {
        serverEl.addEventListener("click", async () => {
            // set up server Peer and display ID
            document.documentElement.classList.add("role-server");

            const peer: PeerJs.Peer = new Peer(generateID());
            const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
            const scoreboard: HTMLOListElement = <HTMLOListElement>document.querySelector(".scoreboard");
            const server: GameServer = await makeGameServer(canvas, peer, scoreboard);
            if(serverIdEl) {
                serverIdEl.innerHTML = `Game ID: ${server.id}`;
            }
        });
    }
    if(playerEl) {
        playerEl.addEventListener("click", () => {
            // show UI to join a game by ID
            document.documentElement.classList.add("role-player");
        });
    }
    if(connectEl) {
        connectEl.addEventListener("click", async () => {
            let id: string = (<HTMLInputElement>(document.querySelector(".id"))).value;
            let name: string = (<HTMLInputElement>(document.querySelector(".player-name"))).value;
            if(id.length && name.length) {
                await joinGame(id);
                document.documentElement.classList.add("game-connected");
            } else {
                // tell the user they need to enter both name and game ID
            }
        });
    }
});

function joinGame(id: string): Promise<void> {
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
                    name: (<HTMLInputElement>document.querySelector(".player-name")).value,
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


function makeGameServer(canvas: HTMLCanvasElement, peer: PeerJs.Peer, scoreboardEl: HTMLOListElement): Promise<GameServer> {
    return new Promise((resolve, reject) => {
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
}

