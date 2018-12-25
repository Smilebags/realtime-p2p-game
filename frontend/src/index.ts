import {
    ErrorWithType,
    IPeerMessage,
    Direction
} from "./types";

import { GameServer } from "./gameServer.js";
import { Player } from "./player.js";


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
                serverIdEl.innerHTML = `Server ID: ${serverId}`;
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
            await joinGame(id);
            document.documentElement.classList.add("game-connected");
        });
    }
});

function joinGame(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer: any = new Peer();

        let conn: any = peer.connect(id);

        let player: Player = new Player({
            name: (<HTMLInputElement>document.querySelector(".player-name")).value,
            location: "client",
            connection: conn
        });

        conn.on("open", () => {
            conn.on("data", (data: IPeerMessage) => {
                player.handleMessage(data);
            });
            conn.send({
                type: "registerPlayer",
                data: {
                    name: player.name
                }
            });
            let upEl: HTMLDivElement | null = document.querySelector(".up");
            let leftEl: HTMLDivElement | null = document.querySelector(".left");
            let downEl: HTMLDivElement | null = document.querySelector(".down");
            let rightEl: HTMLDivElement | null = document.querySelector(".right");
            addInteractionEvents([upEl, leftEl, downEl, rightEl], player);

            resolve();
        });
    });
}


function makeServer(): Promise<string> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        let peer: any = new Peer();
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
        let server: GameServer = new GameServer(canvas);

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
                server.handleMessage(data);
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

function addInteractionEvents(elements: (HTMLDivElement|null)[], player: Player): void {
    let dirArr: string[] = ["up", "left", "down", "right"];
    elements.forEach((element, index) => {
        if(element) {
            element.addEventListener("touchstart", (e) => {
                console.log(`Touchstart: ${dirArr[index]}`);
                e.preventDefault();
                e.stopPropagation();
                player.move(<Direction>dirArr[index]);
            });
        }
    });
}