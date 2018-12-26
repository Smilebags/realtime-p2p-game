import { Player } from "./player.js";

export type IPeerMessage =  {type: "ping", data: Ping} |
                            {type: "playerData", data: IPlayerData} |
                            {type: "registerPlayer", data: IRegisterPlayer} |
                            {type: "playerInfo", data: IPlayerInfo};

interface IPlayerData {
    name: string;
    facing: Direction;
}
interface IPlayerInfo {
    name?: string;
    colour?: string;
    score?: number;
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


export interface IConnection {
    send: (message: IPeerMessage) => void;
    on: ConnectionDataEvent;
}

type ConnectionDataEvent = (eventName: "data", callback: (data: IPeerMessage) => any) => void;

type ConnectionEventNames = "data";


export type ErrorWithType = Error & {type: string};

export type DeviceLocation = "unset" | "host" | "client";

export type Direction = "up" | "down" | "left" | "right";