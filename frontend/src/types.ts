import { Player } from "./player.js";

export interface IPlayerConstructorOptions {
    name: string;
    location: DeviceLocation;
    connection?: any;
    canvasContext?: CanvasRenderingContext2D;

}

export interface IPeerMessage {
    type: "ping" | "playerData" | "registerPlayer";
    data: any;
}

export interface IServerData {
    playerList: Player[];
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
}

export type ErrorWithType = Error & {type: string};

export type DeviceLocation = "unset" | "host" | "client";

export type Direction = "up" | "down" | "left" | "right";