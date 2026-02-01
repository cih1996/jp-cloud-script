import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidScreenModule extends BaseAndroidModule {
    /**
     * 250 屏幕旋转 (被动接收)
     * 此接口通常是被动接收消息，但如果是作为命令发送可能无效或用于查询
     * 根据描述是 "此接口为被动接收"，所以这里可能只需要定义类型或不做主动调用封装
     * 但为了完整性，如果服务端支持主动查询，可以保留
     */
    // async getOrientation(): Promise<any> { ... }
    /**
     * 251 开启视频流
     */
    async startVideoStream(options = {}) {
        const { fps = 30, bit = 400000, quality = 10, width = 540 } = options;
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncStartVideo,
            data: { fps, bit, quality, width }
        });
    }
    /**
     * 252 关闭视频流
     */
    async stopVideoStream() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncStopVideo, data: null });
    }
    /**
     * 299 取图片
     * @param imgType 1=jpeg, 2=webp
     */
    async screenshot(options = {}) {
        const { width = 0, height = 0, qua = 70, scale = 150, x = 0, y = 0, imgType = 2 } = options;
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncImg,
            data: { width, height, qua, scale, x, y, imgType }
        });
    }
}
