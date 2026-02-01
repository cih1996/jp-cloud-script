import WebsocketClass from "./websocket.js";
import { decode } from "@msgpack/msgpack";
import { Func, Protoc } from "./consts.js";
import { errorCode, newError } from "./errors.js";
export class RPAClient {
    /**
     * @description: 初始化参数
     * @param {*} url ws资源路径:ws://127.0.0.1:9009/ws
     * @param heart 心跳间隔ms, 0表示关闭
     * @param retry 重连间隔ms, 0表示关闭
     * @return {*}
     */
    constructor(url, heart = 10000, retry = 1000) {
        this.start = () => {
            this.socket.connect();
        };
        /**
         * 取连接状态
         * @returns 连接状态: 0-关闭 1-连接 2-手动关闭
         */
        this.status = () => {
            return this.socket.Status();
        };
        this.iterCallback = () => {
            return ++this.iter;
        };
        this.log = (msg) => {
            console.log(msg);
        };
        this._onConnect = () => {
            this.onConnect();
        };
        this.onConnect = () => {
            this.log('连接已建立');
        };
        this._onClose = () => {
            this.onClose();
        };
        this.onClose = () => {
            this.log(`连接已断开`);
        };
        this.Close = () => {
            this.socket?.close();
            this.log(`连接已关闭`);
        };
        this.send = (msg) => {
            this.socket?.sendMsgpack(BigInt(0), msg);
        };
        this.sendWithHeader = (to, msg) => {
            msg.seq = this.iterCallback();
            this.socket?.sendMsgpack(BigInt(to), msg);
        };
        this.response = {};
        this.iter = 0;
        this.socket = new WebsocketClass(url, this.ondata.bind(this), this._onConnect.bind(this), this._onClose.bind(this), heart, retry);
    }
    ondata(typ, header, data) {
        switch (typ) {
            case Protoc.TypePing:
                this.socket?.sendPong();
                break;
            case Protoc.TypePong:
                break;
            case Protoc.TypeMsgpack:
                const msg = decode(new Uint8Array(data));
                if (!msg.req) {
                    if (this.response[msg.seq]) {
                        this.response[msg.seq](header, msg);
                        delete this.response[msg.seq];
                        return;
                    }
                    this.log(`纯异步消息或过期消息 ${JSON.stringify(msg)}`);
                }
                else {
                    this.log(`推送的消息 ${JSON.stringify(msg)}`);
                }
                this.onMsg(header, msg);
                break;
            default:
                this.log(`未处理的数据类型 ${typ}`);
        }
    }
    onMsg(from, msg) {
        switch (msg.f) {
            case Func.FuncScreenChange:
                this.log(`推送的事件 ${JSON.stringify(msg)}`);
                break;
            default:
                this.log(`未处理的消息 ${JSON.stringify(msg)}`);
        }
    }
    call(typ, to, msg, timeout = 5000) {
        const seq = ++this.iter;
        msg.seq = seq;
        msg.req = true;
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.Status())
                reject(newError(errorCode.notConnect));
            if (typ == Protoc.TypeJson) {
                this.socket?.sendJson(to, msg);
            }
            else {
                this.socket?.sendMsgpack(to, msg);
            }
            const timer = setTimeout(() => {
                if (this.response[seq]) {
                    delete this.response[seq];
                    reject(newError(errorCode.timeout));
                }
            }, timeout);
            this.response[seq] = (from, e) => {
                clearTimeout(timer);
                delete this.response[seq];
                resolve(e);
            };
        });
    }
    /**
     * 触摸动作
     * @param actions 动作列表
     * @param absolute 是否绝对坐标,true=绝对坐标,false=屏幕宽高的千分比
     * @param seat 设备编号
     */
    touch(actions, absolute = false, seat = 0) {
        const msg = {
            f: absolute ? Func.FuncTouchAbs : Func.FuncTouch,
            req: true,
            data: actions
        };
        return this.call(Protoc.TypeMsgpack, BigInt(seat), msg);
    }
    /**
     * 输入文本,当前焦点必须在可输入的界面元素,否则可以卡在几秒钟
     * @param text 要输入的文本
     * @param seat 设备编号
     */
    sendInput(text, seat = 0) {
        if (!text || text.length === 0) {
            throw new Error('text 不能为空');
        }
        const msg = {
            f: Func.FuncInputText,
            req: true,
            data: { text: text }
        };
        return this.call(Protoc.TypeMsgpack, BigInt(seat), msg);
    }
    /**
     * 查找弹窗的节点信息
     * @param seat 设备编号
     * @returns
     */
    findDialog(seat = 0) {
        const msg = {
            f: Func.FuncFindDialog,
            req: true,
            data: {}
        };
        return this.call(Protoc.TypeMsgpack, BigInt(seat), msg);
    }
}
