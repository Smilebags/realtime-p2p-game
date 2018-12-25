


document.addEventListener("DOMContentLoaded", () => {
    let role: DeviceLocation = "unset";
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
                playerDataHandler(data);
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

            if(upEl) {
                upEl.addEventListener("click", () => {
                    player.move("up");
                });
            }
            if(leftEl) {
                leftEl.addEventListener("click", () => {
                    player.move("left");
                });
            }
            if(downEl) {
                downEl.addEventListener("click", () => {
                    player.move("down");
                });
            }
            if(rightEl) {
                rightEl.addEventListener("click", () => {
                    player.move("right");
                });
            }
            resolve();
        });
    });
}


function playerDataHandler(data: IPeerMessage): void {
    console.log(data);
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


class Player {
    x: number;
    y: number;
    name: string;
    location: DeviceLocation;
    connection?: any;
    ctx?: CanvasRenderingContext2D;
    constructor(options: IPlayerConstructorOptions = {
        name: "",
        location: "unset",
    }) {
        const defaults: IPlayerConstructorOptions = {
            name: "",
            location: "unset"
        };
        options = {
            ...defaults,
            ...options
        };
        this.x = 100;
        this.y = 100;
        this.name = options.name;
        this.location = options.location;
        this.connection = options.connection;
        this.ctx = options.canvasContext;
    }
    render(): void {
        if(this.ctx) {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#000000";
            this.ctx.rect(this.x, this.y, 10, 10);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }
    private update(): void {
        if(this.location === "client") {
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

    move(direction: Direction): void {
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

    setPos(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}

class GameServer {
    playerList: Player[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement) {
        this.playerList = [];
        this.canvas = canvas;
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
        this.render();
    }
    addPlayer(name: string): void {
        this.playerList.push(new Player({
            name,
            location: "host",
            canvasContext: this.context
        }));
    }
    findPlayerByName(name: string): Player | null {
        return this.playerList.find((player) => {
            return player.name === name;
        }) || null;
    }

    render(): void {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.playerList.forEach((player) => {
            player.render();
        });

        requestAnimationFrame(() => {
            this.render();
        });
    }

    handleMessage(message: IPeerMessage): void {
        switch (message.type) {
            case "registerPlayer":
                this.addPlayer(message.data.name);
                break;
            case "playerData":
                let player: Player | null = this.findPlayerByName(message.data.name);
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

interface IPlayerConstructorOptions {
    name: string;
    location: DeviceLocation;
    connection?: any;
    canvasContext?: CanvasRenderingContext2D;

}

interface IPeerMessage {
    type: "ping" | "playerData" | "registerPlayer";
    data: any;
}

interface IServerData {
    playerList: Player[];
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
}

type ErrorWithType = Error & {type: string};

type DeviceLocation = "unset" | "host" | "client";

type Direction = "up" | "down" | "left" | "right";