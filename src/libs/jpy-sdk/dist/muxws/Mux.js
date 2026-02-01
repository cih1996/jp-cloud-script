import { Conn } from "./Conn.js";
const CMD_SYN = 0;
const CMD_FIN = 1;
const CMD_PSH = 2;
const CMD_NOP = 3;
const CMD_UPD = 4;
const VERSION_1 = 1;
export class MuxSession extends Conn {
    constructor(conn) {
        super();
        this.streamId = 0;
        this.streamMap = {};
        this.conn = conn;
        const headerBuf = new Uint8Array(8);
        const that = this;
        (async function () {
            while (true) {
                try {
                    await conn.readFull(headerBuf);
                    const v = headerBuf[0];
                    const cmd = headerBuf[1];
                    switch (cmd) {
                        case CMD_NOP:
                            conn.write(headerBuf);
                            continue;
                        case CMD_PSH:
                            const streamIdBuf = headerBuf.slice(4, 8);
                            const streamId = new DataView(streamIdBuf.buffer, streamIdBuf.byteOffset, streamIdBuf.byteLength).getUint32(0, true);
                            if (that.streamMap[streamId]) {
                                const lengthBuf = headerBuf.slice(2, 4);
                                const len = new DataView(lengthBuf.buffer, lengthBuf.byteOffset, lengthBuf.byteLength).getUint16(0, true);
                                const dataBuf = new Uint8Array(len);
                                await conn.readFull(dataBuf);
                                that.streamMap[streamId]._onData(dataBuf);
                            }
                            else {
                                // Consume data even if stream not found to avoid desync
                                const lengthBuf = headerBuf.slice(2, 4);
                                const len = new DataView(lengthBuf.buffer, lengthBuf.byteOffset, lengthBuf.byteLength).getUint16(0, true);
                                const dataBuf = new Uint8Array(len);
                                await conn.readFull(dataBuf);
                            }
                            break;
                        case CMD_FIN:
                            {
                                const streamIdBuf = headerBuf.slice(4, 8);
                                const streamId = new DataView(streamIdBuf.buffer, streamIdBuf.byteOffset, streamIdBuf.byteLength).getUint32(0, true);
                                if (that.streamMap[streamId]) {
                                    that.streamMap[streamId].close();
                                    delete that.streamMap[streamId];
                                }
                            }
                            break;
                    }
                }
                catch (e) {
                    // console.error("Mux session loop error", e);
                    that.close();
                    break;
                }
            }
        })();
        if (this.conn.isOpen) {
            this.open();
        }
        else {
            this.conn.addOpenEventListener(() => {
                that.open();
            });
        }
    }
    openStream() {
        this.streamId += 2;
        const muxConn = new MuxConn(this.streamId, this);
        this.streamMap[this.streamId] = muxConn;
        return muxConn;
    }
    _write(buf) {
        this.conn.write(buf);
    }
    _close() {
        for (const key in this.streamMap) {
            this.streamMap[key].close();
            delete this.streamMap[key];
        }
        this.conn.close();
    }
    _getBufferedAmount() {
        return this.conn.getBufferedAmount();
    }
    _localAddr() {
        return this.conn.localAddr();
    }
    _remoteAddr() {
        return this.conn.remoteAddr();
    }
}
export class MuxConn extends Conn {
    constructor(streamId, muxSession) {
        super();
        this.streamId = 0;
        this.sendHeaderBuf = new Uint8Array(8);
        this.streamId = streamId;
        const streamIdBuf = new Uint8Array(4);
        new DataView(streamIdBuf.buffer, streamIdBuf.byteOffset, streamIdBuf.byteLength).setUint32(0, streamId, true);
        this.sendHeaderBuf[0] = VERSION_1;
        this.sendHeaderBuf[1] = CMD_SYN;
        this.sendHeaderBuf.set(streamIdBuf, 4);
        muxSession.write(this.sendHeaderBuf);
        this.muxSession = muxSession;
        // MuxConn is open immediately when created/synced
        this.open();
    }
    _close() {
        delete this.muxSession.streamMap[this.streamId];
        const sendHeaderBuf = new Uint8Array(8);
        const streamIdBuf = new Uint8Array(4);
        new DataView(streamIdBuf.buffer, streamIdBuf.byteOffset, streamIdBuf.byteLength).setUint32(0, this.streamId, true);
        sendHeaderBuf[0] = VERSION_1;
        sendHeaderBuf[1] = CMD_FIN;
        sendHeaderBuf.set(streamIdBuf, 4);
        this.muxSession.write(sendHeaderBuf);
    }
    _getBufferedAmount() {
        return this.muxSession.getBufferedAmount();
    }
    _localAddr() {
        return this.muxSession.localAddr();
    }
    _remoteAddr() {
        return this.muxSession.remoteAddr();
    }
    _write(buf) {
        const header = new Uint8Array(8);
        header[0] = VERSION_1;
        header[1] = CMD_PSH;
        new DataView(header.buffer, header.byteOffset, header.byteLength).setUint16(2, buf.length, true);
        new DataView(header.buffer, header.byteOffset, header.byteLength).setUint32(4, this.streamId, true);
        const packet = new Uint8Array(8 + buf.length);
        packet.set(header);
        packet.set(buf, 8);
        this.muxSession.write(packet);
    }
}
