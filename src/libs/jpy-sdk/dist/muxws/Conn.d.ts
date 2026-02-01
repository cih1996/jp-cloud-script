export declare const sleep: (ms: number) => Promise<unknown>;
/**
 * Abstract Connection Class
 */
export declare abstract class Conn {
    isClosed: boolean;
    isOpen: boolean;
    readBuffer: Uint8Array;
    readLock: boolean;
    readDeadline: number;
    writeDeadline: number;
    readResolve: (() => void) | null;
    closeEventListener: ((...args: any[]) => void)[];
    openEventListener: ((...args: any[]) => void)[];
    maxBufferSize: number;
    protected messageQueue: Promise<void>;
    protected sendBufQueue: Promise<void>;
    protected constructor();
    open(): void;
    addOpenEventListener(listener: () => void): void;
    addCloseEventListener(listener: () => void): void;
    _onData: (arrayBuffer: Uint8Array) => void;
    read(readBuf: Uint8Array): Promise<number>;
    readFull(readBuf: Uint8Array): Promise<void>;
    abstract _write(buf: Uint8Array): void;
    write(buf: Uint8Array): number;
    private _writeQueue;
    abstract _close(): void;
    close(): void;
    abstract _getBufferedAmount(): number;
    getBufferedAmount(): number;
    abstract _localAddr(): string;
    localAddr(): string;
    abstract _remoteAddr(): string;
    remoteAddr(): string;
}
