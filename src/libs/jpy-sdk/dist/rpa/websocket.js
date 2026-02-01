import { encode } from "@msgpack/msgpack";
import { Protoc } from './consts.js';
export default class WebsocketClass {
    /**
     * @description: 初始化参数
     * @param {*} url ws资源路径
     * @param {*} callback 服务端信息回调
     * @param {*} OnConnect 连接成功的回调
     * @param OnClose
     * @param heart 心跳间隔ms, 0表示关闭
     * @param retry 重连间隔ms, 0表示关闭
     * @return {*}
     */
    constructor(url, callback, OnConnect, OnClose, heart = 10000, retry = 1000) {
        this.url = url;
        this.callback = callback;
        this.OnConnect = OnConnect;
        this.OnClose = OnClose;
        this.onError = undefined;
        this.ws = null; // websocket 对象
        this.status = 0; // 连接状态: 0-关闭 1-连接 2-手动关闭
        this.ping = heart; // 心跳时长
        this.pingInterval = undefined; // 心跳定时器
        this.reconnect = retry; // 重连间隔
        this.pingData = this.makeHeartData(Protoc.TypePing);
        this.pongData = this.makeHeartData(Protoc.TypePong);
    }
    /**
     * @description: 连接
     * @param {*}
     * @return {*}
     */
    connect() {
        this.ws = new WebSocket(this.url);
        // 监听socket连接
        this.ws.onopen = () => {
            this.status = 1;
            if (this.OnConnect) {
                this.OnConnect();
            }
            this.heartHandler();
        };
        // 监听socket消息
        this.ws.onmessage = async (e) => {
            this.onData(e);
        };
        // 监听socket错误信息
        this.ws.onerror = (e) => {
            if (this.onError) {
                this.onError(e);
            }
        };
        // 监听socket关闭
        this.ws.onclose = (e) => {
            if (this.OnClose) {
                this.OnClose();
            }
            this.onClose(e);
        };
    }
    onData(e) {
        if (e.data instanceof Blob) {
            e.data.arrayBuffer().then((arrayBuffer) => {
                this.parserData(arrayBuffer);
            });
        }
        else if (e.data instanceof ArrayBuffer) {
            this.parserData(e.data);
        }
        else {
            console.log("error data type:", typeof (e.data));
        }
    }
    parserData(arrayBuffer) {
        const dv = new DataView(arrayBuffer);
        const typ = dv.getUint8(0); // 读取第一个字节表示的 uint8 类型
        const hl = dv.getUint8(1); //头长度
        let header = BigInt(0);
        if (hl == 8) {
            header = dv.getBigUint64(2, true);
        }
        if (arrayBuffer.byteLength <= 2 + hl) {
            const data = new ArrayBuffer;
            this.callback(typ, header, data);
        }
        else {
            const data = arrayBuffer.slice(2 + hl);
            this.callback(typ, header, data);
        }
    }
    onMsg(typ, header, data) {
        console.log(typ, header.toString(), data);
    }
    send1v1(typ, header, data) {
        const len = 10 + data.byteLength;
        const buffer = new Uint8Array(len);
        buffer[0] = typ;
        buffer[1] = 8;
        const dv = new DataView(buffer.buffer);
        dv.setBigUint64(2, header, true);
        buffer.set(data, 10);
        this.ws?.send(buffer.buffer);
    }
    send1vN(typ, to, data) {
        const len = 2 + to.length * 8 + data.byteLength;
        const buffer = new Uint8Array(len);
        buffer[0] = typ;
        buffer[1] = to.length * 8;
        const dv = new DataView(buffer.buffer);
        to.forEach((header, index) => {
            dv.setBigUint64(2 + index * 8, header, true);
        });
        buffer.set(data, 2 + to.length * 8);
        this.ws?.send(buffer.buffer);
    }
    send(typ, to, data) {
        if (Array.isArray(to)) {
            for (let i = 0; i < to.length; i += 30) {
                this.send1vN(typ, to.slice(i, i + 30), data);
            }
        }
        else {
            this.send1v1(typ, to, data);
        }
    }
    sendMsgpack(to, msg) {
        const data = encode(msg);
        this.send(Protoc.TypeMsgpack, to, new Uint8Array(data));
    }
    sendJson(to, msg) {
        const str = JSON.stringify(msg);
        const data = new TextEncoder().encode(str);
        this.send(Protoc.TypeJson, to, data);
    }
    sendPing() {
        if (this.status === 1) {
            this.ws?.send(this.pingData);
        }
    }
    sendPong() {
        if (this.status === 1) {
            this.ws?.send(this.pongData);
        }
    }
    setErrorHandle(f) {
        this.onError = f;
    }
    /**
     * @description: 取当前服务状态
     * @return number
     */
    Status() {
        return this.status;
    }
    /**
     * @description: 关闭weibsocket 主动关闭不会触发重连
     * @param {*}
     * @return {*}
     */
    close() {
        this.status = 2;
        this.ws?.close();
    }
    /**
     * @description: socket关闭事件
     * @return {*}
     * @param e
     */
    onClose(e) {
        console.error(e);
        this.status = this.status === 2 ? this.status : 0;
        if (this.reconnect == 0) {
            return;
        }
        setTimeout(() => {
            if (this.status === 0) {
                this.connect();
            }
        }, this.reconnect);
    }
    /**
     * @description: 心跳机制
     * @param {*}
     * @return {*}
     */
    heartHandler() {
        if (this.ping == 0) {
            return;
        }
        this.pingInterval = setInterval(() => {
            if (this.status === 1) {
                this.ws?.send(this.pingData);
            }
            else {
                clearInterval(this.pingInterval);
            }
        }, this.ping, undefined);
    }
    makeHeartData(typ) {
        const buf = new ArrayBuffer(10);
        const dv = new DataView(buf);
        dv.setUint8(0, typ);
        dv.setUint8(1, 8);
        dv.setBigUint64(2, BigInt(0), true);
        return dv.buffer;
    }
}
