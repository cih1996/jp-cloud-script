export default class WebsocketClass {
    private readonly url;
    private readonly callback;
    private ws;
    private status;
    private readonly ping;
    private pingInterval;
    private readonly reconnect;
    private readonly OnConnect;
    private readonly OnClose;
    private onError;
    private readonly pingData;
    private readonly pongData;
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
    constructor(url: string, callback: (typ: number, header: bigint, data: ArrayBuffer) => void, OnConnect: Function, OnClose: Function, heart?: number, retry?: number);
    /**
     * @description: 连接
     * @param {*}
     * @return {*}
     */
    connect(): void;
    private onData;
    private parserData;
    onMsg(typ: number, header: bigint, data: ArrayBuffer): void;
    private send1v1;
    private send1vN;
    send(typ: number, to: bigint | bigint[], data: Uint8Array): void;
    sendMsgpack(to: bigint | bigint[], msg: MsgpackMsgType): void;
    sendJson(to: bigint | bigint[], msg: MsgpackMsgType): void;
    sendPing(): void;
    sendPong(): void;
    setErrorHandle(f: Function): void;
    /**
     * @description: 取当前服务状态
     * @return number
     */
    Status(): number;
    /**
     * @description: 关闭weibsocket 主动关闭不会触发重连
     * @param {*}
     * @return {*}
     */
    close(): void;
    /**
     * @description: socket关闭事件
     * @return {*}
     * @param e
     */
    onClose(e: CloseEvent): void;
    /**
     * @description: 心跳机制
     * @param {*}
     * @return {*}
     */
    heartHandler(): void;
    private makeHeartData;
}
