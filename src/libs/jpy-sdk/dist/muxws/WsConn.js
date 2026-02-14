import WebSocket from 'isomorphic-ws';
import { Conn } from './Conn.js';
export class WsConn extends Conn {
    constructor(ws) {
        super();
        this.ws = ws;
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.addEventListener('close', (event) => {
            this.isClosed = true;
            console.warn(`ws disconnected. Code: ${event.code}, Reason: ${event.reason}`);
            this.close();
        });
        this.ws.addEventListener('error', (event) => {
            console.warn("ws error", event);
            this.close();
        });
        if (this.ws.readyState === WebSocket.OPEN) {
            this.open();
        }
        else {
            this.ws.addEventListener('open', () => {
                this.open();
            });
        }
    }
    handleMessage(ev) {
        this.messageQueue = this.messageQueue.then(async () => {
            const data = ev.data;
            try {
                let arrayBuffer;
                if (typeof Buffer !== 'undefined' && data instanceof Buffer) {
                    arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                }
                else if (data instanceof ArrayBuffer) {
                    arrayBuffer = data;
                }
                else if (Array.isArray(data)) { // Buffer[] in some cases? Unlikely for isomorphic-ws
                    // Node buffer usually
                    if (typeof Buffer !== 'undefined') {
                        const buf = Buffer.concat(data);
                        arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
                    }
                    else {
                        console.warn("Received array data in browser without Buffer support");
                        return;
                    }
                }
                else {
                    // Blob in browser
                    if (data.arrayBuffer) {
                        arrayBuffer = await data.arrayBuffer();
                    }
                    else {
                        console.warn("Unknown data type", data);
                        return;
                    }
                }
                const uint8Data = new Uint8Array(arrayBuffer);
                // const hex = Array.from(uint8Data).map(b => b.toString(16).padStart(2, '0')).join(' ');
                // console.log(`[SDK-DEBUG-WS] Received WS Message (${uint8Data.length} bytes): ${hex}`);
                this._onData(uint8Data);
            }
            catch (err) {
                console.warn("Handle message error", data, err);
                this.close();
            }
        }).catch(err => {
            console.warn("Handle message error", err);
            this.close();
        });
    }
    _write(buf) {
        this.ws.send(buf);
    }
    _close() {
        this.ws.close();
    }
    _getBufferedAmount() {
        return this.ws.bufferedAmount;
    }
    _localAddr() {
        return this.ws.url;
    }
    _remoteAddr() {
        return this.ws.url;
    }
}
