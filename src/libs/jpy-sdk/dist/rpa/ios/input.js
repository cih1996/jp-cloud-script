import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSInputModule extends BaseIOSModule {
    /**
     * 257 触摸(绝对坐标)
     */
    async touchAbsolute(points) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTouchAbs,
            data: points
        });
    }
    /**
     * 258 触摸(相对坐标)
     */
    async touchRelative(points) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTouch,
            data: points
        });
    }
    /**
     * 281 按键(home/音量加减)
     * keyCode: 64=home, 233=音量+, 234=音量-
     * action: 0=按下，1=抬起，3=按下延迟50ms后抬起
     */
    async pressKey(keyCode, action = 3, usage = 12) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncKey,
            data: { action, usage, keyCode }
        });
    }
    /**
     * 769 输入文本
     */
    async inputText(text) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncInputText,
            data: { text }
        });
    }
}
