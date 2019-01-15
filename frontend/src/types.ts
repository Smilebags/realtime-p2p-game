import { HostPlayer } from "./player.js";

/// <reference types="peerjs" />

// gives proper types for the data given the type property value
export type IPeerMessage =  {type: "ping", data: Ping} |
                            {type: "playerData", data: IPlayerData} |
                            {type: "registerPlayer", data: IRegisterPlayer} |
                            {type: "playerInfo", data: IPlayerInfo};

export interface IPlayerData {
    name: string;
    facing: Direction;
}

export interface IPlayerInfo {
    name?: string;
    colour?: string;
    score?: number;
}
export interface IRegisterPlayer {
    name: string;
}


type Ping = Number;

export interface IServerData {
    playerList: HostPlayer[];
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
}

type ConnectionDataEvent = (eventName: "data", callback: (data: IPeerMessage) => any) => void;

type ConnectionEventNames = "data";


export type ErrorWithType = Error & {type: string};

export type DeviceLocation = "unset" | "host" | "client";

export type Direction = "up" | "down" | "left" | "right";