// todo: Add scoreboard to main screen
// todo: Add easier way to join game (create join link on game host)

import {
    ErrorWithType,
    IPeerMessage,
} from "./types";

import { GameServer } from "./gameServer.js";
import { ClientPlayer } from "./player.js";

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
            let serverId: string = await makeServer();
            if(serverIdEl) {
                serverIdEl.innerHTML = `Game ID: ${serverId}`;
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
        // @ts-ignore
        let peer: any = new Peer();

        let conn: any = peer.connect(id);


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


function makeServer(): Promise<string> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer: any = new Peer();
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
        // canvas.width = 1000;
        // canvas.height = 1000;
        let server: GameServer = new GameServer(canvas, worldSize, 1000);

        peer.on("open", function (id: string): void {
            resolve(id);
            console.log("ID: " + id);
        });

        peer.on("error", function (err:ErrorWithType): void {
            if (err.type === "unavailable-id") {
                alert("" + err);
                peer.reconnect();
            } else {
                alert(err);
            }
        });

        peer.on("connection", (conn: any) => {
            conn.on("data", (data: IPeerMessage) => {
                server.handleMessage(data, conn);
            });
            peer.on("disconnected", () => {
                alert("Connection has been lost.");
                peer.reconnect();
            });
            let i: number = 0;
            setInterval(() => {
                conn.send({type:"ping", data:i++});
            }, 1000);
        });
    });
}

