export declare class RPAClient {
    private iter;
    private socket;
    private response;
    /**
     * @description: 初始化参数
     * @param {*} url ws资源路径:ws://127.0.0.1:9009/ws
     * @param heart 心跳间隔ms, 0表示关闭
     * @param retry 重连间隔ms, 0表示关闭
     * @return {*}
     */
    constructor(url: string, heart?: number, retry?: number);
    start: () => void;
    /**
     * 取连接状态
     * @returns 连接状态: 0-关闭 1-连接 2-手动关闭
     */
    status: () => number;
    private iterCallback;
    log: (msg: any) => void;
    private _onConnect;
    onConnect: () => void;
    private _onClose;
    onClose: () => void;
    Close: () => void;
    private ondata;
    onMsg(from: bigint, msg: MsgpackMsgType): void;
    call(typ: number, to: bigint, msg: MsgpackMsgType, timeout?: number): Promise<MsgpackMsgType>;
    send: (msg: MsgpackMsgType) => void;
    sendWithHeader: (to: number, msg: MsgpackMsgType) => void;
    /**
     * 触摸动作
     * @param actions 动作列表
     * @param absolute 是否绝对坐标,true=绝对坐标,false=屏幕宽高的千分比
     * @param seat 设备编号
     */
    touch(actions: TouchActionType[], absolute?: boolean, seat?: number): Promise<any>;
    /**
     * 输入文本,当前焦点必须在可输入的界面元素,否则可以卡在几秒钟
     * @param text 要输入的文本
     * @param seat 设备编号
     */
    sendInput(text: string, seat?: number): Promise<any>;
    /**
     * 查找弹窗的节点信息
     * @param seat 设备编号
     * @returns
     */
    findDialog(seat?: number): Promise<any>;
}
