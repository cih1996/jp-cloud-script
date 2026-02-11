import { sleep } from "./Conn.js";
import { TcpType } from "./TcpType.js";
import { ungzip } from 'pako';
const textEncoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8');
function toHex(buffer) {
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join(' ');
}
export class SendInterface {
    static addDebugListener(listener) {
        this.debugListeners.push(listener);
    }
    emitDebug(type, data, label) {
        try {
            SendInterface.debugListeners.forEach(l => l(type, data, label));
        }
        catch (e) {
            console.error("Debug listener error", e);
        }
    }
    constructor(conn) {
        this.callId = 1;
        this.call = {};
        // Callbacks for pushed data/events
        this.onDataFun = () => { };
        this.onByteFun = () => { };
        this.onErr = () => { };
        this.onClose = () => { };
        this.conn = conn;
        const that = this;
        // Reader loop
        (async function () {
            try {
                const headerBuf = new Uint8Array(4);
                while (true) {
                    await conn.readFull(headerBuf);
                    // Little Endian length
                    const len = headerBuf[0] | (headerBuf[1] << 8) | (headerBuf[2] << 16) | (headerBuf[3] << 24);
                    const data = new Uint8Array(len);
                    await conn.readFull(data);
                    try {
                        const ml = data[0];
                        console.log(`[SDK-DEBUG] 接收数据类型：${ml}`);
                        switch (ml) {
                            case TcpType.TcpType_GzipRtext:
                            case TcpType.TcpType_GzipRCommand:
                            case TcpType.TcpType_RText:
                            case TcpType.TcpType_RCommand: {
                                // Little Endian ID
                                const callback = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
                                console.log(`[SDK-DEBUG] 接收响应. Type=${ml}, ID=${callback}. 已注册回调:`, Object.keys(that.call));
                                // Print data payload
                                let payload = data.slice(5);
                                // GZIP Detection & Decompression
                                let gzipOffset = -1;
                                let needsDecompression = (ml === TcpType.TcpType_GzipRtext || ml === TcpType.TcpType_GzipRCommand);
                                if (needsDecompression) {
                                    // For explicit Gzip types, the payload starts at 0 (relative to slice(5))
                                    gzipOffset = 0;
                                }
                                else {
                                    // For normal types, check for magic bytes just in case (as per previous logic)
                                    for (let i = 0; i < payload.length && i < 32; i++) {
                                        if (i + 1 < payload.length && payload[i] === 0x1f && payload[i + 1] === 0x8b) {
                                            gzipOffset = i;
                                            break;
                                        }
                                    }
                                }
                                if (gzipOffset !== -1) {
                                    try {
                                        const compressed = payload.slice(gzipOffset);
                                        const decompressed = ungzip(compressed);
                                        console.log(`[SDK-DEBUG] GZIP解压成功, Type=${ml}, Offset=${gzipOffset}, 原始大小=${payload.length}, 解压后=${decompressed.length}`);
                                        payload = decompressed;
                                    }
                                    catch (e) {
                                        console.error(`[SDK-DEBUG] GZIP解压失败:`, e);
                                    }
                                }
                                const payloadStr = utf8Decoder.decode(payload);
                                console.log(`[SDK-DEBUG] 响应数据 (String): ${payloadStr}`);
                                console.log(`[SDK-DEBUG] 响应数据 (Hex): ${toHex(payload)}`);
                                if (that.call[callback]) {
                                    console.log(`[SDK-DEBUG] 调用回调函数 ID=${callback}`);
                                    that.call[callback](payload);
                                }
                                else {
                                    console.error(`[SDK-DEBUG] 未知回调ID ${callback}. 已注册:`, Object.keys(that.call));
                                }
                                break;
                            }
                            case TcpType.TcpType_Pong: {
                                // Little Endian ID
                                const callback = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
                                console.log(`[SDK-DEBUG] 收到 Pong 响应. ID=${callback}`);
                                if (that.call[callback]) {
                                    that.call[callback](data.slice(5));
                                }
                                else {
                                    console.error(`[SDK-DEBUG] 未知回调 ID (Pong) ${callback}`);
                                }
                                break;
                            }
                            case TcpType.TcpType_Ping: {
                                data[0] = TcpType.TcpType_Pong;
                                const buf = new Uint8Array(headerBuf.length + data.length);
                                buf.set(headerBuf);
                                buf.set(data, headerBuf.length);
                                conn.write(buf);
                                break;
                            }
                            case TcpType.TcpType_Text: {
                                // Little Endian ID
                                const callback = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
                                const dataStr = utf8Decoder.decode(data.slice(5));
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    that.emitDebug('ws-push', parsed, `callback-${callback}`);
                                }
                                catch (e) {
                                    that.emitDebug('ws-push', { raw: dataStr }, `callback-${callback}`);
                                }
                                that.onDataFun(callback, dataStr);
                                break;
                            }
                            default:
                                that.onByteFun(ml, data.slice(1));
                        }
                    }
                    catch (e) {
                        console.error("处理数据错误", e);
                    }
                }
            }
            catch (e) {
                // console.error("读取循环错误", e);
                conn.close();
                that.onClose(e);
            }
        })();
        // Heartbeat loop
        (async function () {
            while (!that.conn.isClosed) {
                await sleep(30 * 1000); // 30 seconds
                try {
                    await that.ping();
                }
                catch (e) {
                    // Ignore ping errors or log
                }
            }
        })();
    }
    async ping() {
        const buf = new Uint8Array(8);
        const dataT = new Date().getTime();
        // Big Endian float64
        new DataView(buf.buffer, buf.byteOffset, buf.byteLength).setFloat64(0, dataT, false);
        await this._sendByte(TcpType.TcpType_Ping, buf, 30000);
        return dataT;
    }
    async _sendByte(type, data, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const id = this.callId++;
            const idBuf = new Uint8Array(4);
            // Little Endian int32
            idBuf[0] = id & 0xff;
            idBuf[1] = (id >> 8) & 0xff;
            idBuf[2] = (id >> 16) & 0xff;
            idBuf[3] = (id >> 24) & 0xff;
            const packetLen = 1 + 4 + data.length; // Type(1) + ID(4) + Data
            const packet = new Uint8Array(packetLen);
            packet[0] = type;
            packet.set(idBuf, 1);
            packet.set(data, 5);
            // Frame length (4 bytes Little Endian) + packet
            const frameLen = packetLen;
            const frameHeader = new Uint8Array(4);
            frameHeader[0] = frameLen & 0xff;
            frameHeader[1] = (frameLen >> 8) & 0xff;
            frameHeader[2] = (frameLen >> 16) & 0xff;
            frameHeader[3] = (frameLen >> 24) & 0xff;
            const finalBuf = new Uint8Array(4 + packetLen);
            finalBuf.set(frameHeader);
            finalBuf.set(packet, 4);
            // console.log(`[SDK-DEBUG] Sending Packet: Type=${type}, ID=${id}, DataLen=${data.length}, PacketLen=${packetLen}`);
            // console.log(`[SDK-DEBUG] FrameHeader (LittleEndian): ${toHex(frameHeader)}`);
            // console.log(`[SDK-DEBUG] Packet Body: ${toHex(packet)}`);
            const timer = setTimeout(() => {
                delete this.call[id];
                reject(new Error("请求超时"));
            }, timeout);
            console.log(`[SDK-DEBUG] 注册回调函数 ID=${id}`);
            this.call[id] = (response) => {
                console.log(`[SDK-DEBUG] 回调函数触发 ID=${id}`);
                clearTimeout(timer);
                delete this.call[id];
                resolve(response);
            };
            try {
                this.conn.write(finalBuf);
            }
            catch (e) {
                clearTimeout(timer);
                delete this.call[id];
                reject(e);
            }
        });
    }
    // sendFun(app: string, method: string, data: any): Promise<any>
    async sendFun(app, method, data) {
        const reqData = {
            app: app,
            fun: method,
            data: data
        };
        this.emitDebug('ws-send', reqData, `${app}/${method}`);
        const jsonStr = JSON.stringify(reqData);
        console.log(`[SDK-DEBUG] 发送数据: ${jsonStr}`);
        const buf = textEncoder.encode(jsonStr);
        const responseBuf = await this._sendByte(TcpType.TcpType_Text, buf);
        const responseStr = utf8Decoder.decode(responseBuf);
        console.log(`[SDK-DEBUG] 接收数据: ${responseStr}`);
        try {
            const res = JSON.parse(responseStr);
            this.emitDebug('ws-recv', res, `${app}/${method}`);
            return res.data; // Usually return res.data or res
        }
        catch (e) {
            this.emitDebug('ws-recv', { raw: responseStr }, `${app}/${method}`);
            return responseStr; // Return raw string if not JSON
        }
    }
}
SendInterface.debugListeners = [];
