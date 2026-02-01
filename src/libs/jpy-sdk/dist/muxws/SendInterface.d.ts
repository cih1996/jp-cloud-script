import { Conn } from "./Conn.js";
export declare class SendInterface {
    private callId;
    private conn;
    private call;
    onDataFun: (callback: number, data: string) => void;
    onByteFun: (ml: number, data: Uint8Array) => void;
    onErr: (e: any) => void;
    onClose: (e: any) => void;
    constructor(conn: Conn);
    ping(): Promise<number>;
    private _sendByte;
    sendFun(app: string, method: string, data: any): Promise<any>;
}
