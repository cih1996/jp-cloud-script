import { Conn } from "./Conn.js";
export declare class MuxSession extends Conn {
    conn: Conn;
    streamId: number;
    streamMap: {
        [key: number]: MuxConn;
    };
    constructor(conn: Conn);
    openStream(): MuxConn;
    _write(buf: Uint8Array): void;
    _close(): void;
    _getBufferedAmount(): number;
    _localAddr(): string;
    _remoteAddr(): string;
}
export declare class MuxConn extends Conn {
    streamId: number;
    muxSession: MuxSession;
    sendHeaderBuf: Uint8Array<ArrayBuffer>;
    constructor(streamId: number, muxSession: MuxSession);
    _close(): void;
    _getBufferedAmount(): number;
    _localAddr(): string;
    _remoteAddr(): string;
    _write(buf: Uint8Array): void;
}
