import WebSocket from 'isomorphic-ws';
import { Conn } from './Conn.js';
export declare class WsConn extends Conn {
    ws: WebSocket;
    constructor(ws: WebSocket);
    private setupWebSocket;
    private handleMessage;
    _write(buf: Uint8Array): void;
    _close(): void;
    _getBufferedAmount(): number;
    _localAddr(): string;
    _remoteAddr(): string;
}
