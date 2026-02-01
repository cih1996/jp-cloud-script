import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSScreenModule extends BaseIOSModule {
    /**
     * 299 截图
     */
    async screenshot(options = { qua: 70, scale: 0, imgType: 0, x: 0, y: 0, width: 0, height: 0 }) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncImg, data: options });
    }
}
