import { sleep } from "./Conn.js";
import { TcpType } from "./TcpType.js";
const textEncoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8');
function toHex(buffer) {
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join(' ');
}
export class SendInterface {
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
        console.log("[SDK-DEBUG] SendInterface initialized (Version: 2026-01-29 12:00)");
        // Reader loop
        (async function () {
            try {
                const headerBuf = new Uint8Array(4);
                while (true) {
                    await conn.readFull(headerBuf);
                    // Little Endian length
                    const len = headerBuf[0] | (headerBuf[1] << 8) | (headerBuf[2] << 16) | (headerBuf[3] << 24);
                    console.log(`[SDK-DEBUG] Received Header: ${toHex(headerBuf)}, ParsedLen=${len}`);
                    const data = new Uint8Array(len);
                    await conn.readFull(data);
                    console.log(`[SDK-DEBUG] Received Data Body (${len} bytes): ${toHex(data)}`);
                    try {
                        const ml = data[0];
                        switch (ml) {
                            case TcpType.TcpType_RText:
                            case TcpType.TcpType_RCommand: {
                                // Little Endian ID
                                const callback = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
                                console.log(`[SDK-DEBUG] Received Response. Type=${ml}, ID=${callback}. Registered Callbacks:`, Object.keys(that.call));
                                if (that.call[callback]) {
                                    console.log(`[SDK-DEBUG] Invoking callback for ID=${callback}`);
                                    that.call[callback](data.slice(5));
                                }
                                else {
                                    console.error(`[SDK-DEBUG] Unknown callback ID ${callback}. Available:`, Object.keys(that.call));
                                }
                                break;
                            }
                            case TcpType.TcpType_Pong: {
                                // Little Endian ID
                                const callback = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
                                if (that.call[callback]) {
                                    that.call[callback](data.slice(5));
                                }
                                else {
                                    console.error("Unknown callback ID (Pong)", callback);
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
                                that.onDataFun(callback, dataStr);
                                break;
                            }
                            default:
                                that.onByteFun(ml, data.slice(1));
                        }
                    }
                    catch (e) {
                        console.error("Packet processing error", e);
                    }
                }
            }
            catch (e) {
                // console.error("Read loop error", e);
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
            console.log(`[SDK-DEBUG] Sending Packet: Type=${type}, ID=${id}, DataLen=${data.length}, PacketLen=${packetLen}`);
            console.log(`[SDK-DEBUG] FrameHeader (LittleEndian): ${toHex(frameHeader)}`);
            console.log(`[SDK-DEBUG] Packet Body: ${toHex(packet)}`);
            const timer = setTimeout(() => {
                delete this.call[id];
                reject(new Error("Request timeout"));
            }, timeout);
            console.log(`[SDK-DEBUG] Registering callback for ID=${id}`);
            this.call[id] = (response) => {
                console.log(`[SDK-DEBUG] Callback triggered for ID=${id}`);
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
        const jsonStr = JSON.stringify(reqData);
        console.log(`[SDK-DEBUG] sendFun Payload: ${jsonStr}`);
        const buf = textEncoder.encode(jsonStr);
        const responseBuf = await this._sendByte(TcpType.TcpType_Text, buf);
        const responseStr = utf8Decoder.decode(responseBuf);
        try {
            const res = JSON.parse(responseStr);
            if (res.code !== 200) { // Assuming 200 is success
                // You might want to throw error if code != 200 or return structure
                // Adjust based on actual API contract
            }
            return res.data; // Usually return res.data or res
        }
        catch (e) {
            return responseStr; // Return raw string if not JSON
        }
    }
}
