import { Player } from "./player.js";

export interface IPlayerConstructorOptions {
    name: string;
    location: DeviceLocation;
    connection?: any;
    canvasContext?: CanvasRenderingContext2D;
    worldSize: number;
    colour?: string;
}

export type IPeerMessage =  {type: "ping", data: Ping} |
                            {type: "playerData", data: IPlayerData} |
                            {type: "registerPlayer", data: IRegisterPlayer} |
                            {type: "playerInfo", data: IPlayerInfo};

interface IPlayerData {
    name: string;
    facing: Direction;
}
interface IPlayerInfo {
    name: string;
    colour: string;
    score: number;
}
interface IRegisterPlayer {
    name: string;
}
type Ping = Number;

export interface IServerData {
    playerList: Player[];
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
}

export type ErrorWithType = Error & {type: string};

export type DeviceLocation = "unset" | "host" | "client";

export type Direction = "up" | "down" | "left" | "right";