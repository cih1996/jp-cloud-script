import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidInputModule extends BaseAndroidModule {
    /**
     * 258 触屏（鼠标）
     * @param type 0按下 1抬起 2移动
     * @param id 手指编号
     * @param pressure 压力值 0~1
     */
    async touch(type, x, y, id = 1, pressure = 1, offset = 0) {
        this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTouch,
            data: [{ type, x, y, id, offset, pressure }]
        });
    }
    /**
     * 259 滚轮
     * @param upOrDown -1向下，1向上
     */
    async scroll(upOrDown, x, y) {
        this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncScroll,
            data: { upOrDown, x, y }
        });
    }
    /**
     * 281 按键
     * @param action 0按下 1抬起 3按下并抬起 4组合ctrl键
     */
    async pressKey(keyCode, action = 3) {
        this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncKey,
            data: { action, keyCode }
        });
    }
    /**
     * 769 输入文本
     */
    async inputText(text) {
        this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncInputText, data: { text } });
    }
    /**
     * 770 获取剪切板内容
     */
    async getClipboard() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetClipBoard });
    }
}
