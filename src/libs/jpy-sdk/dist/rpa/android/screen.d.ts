import { BaseAndroidModule } from './base.js';
export declare class AndroidScreenModule extends BaseAndroidModule {
    /**
     * 250 屏幕旋转 (被动接收)
     * 此接口通常是被动接收消息，但如果是作为命令发送可能无效或用于查询
     * 根据描述是 "此接口为被动接收"，所以这里可能只需要定义类型或不做主动调用封装
     * 但为了完整性，如果服务端支持主动查询，可以保留
     */
    /**
     * 251 开启视频流
     */
    startVideoStream(options?: {
        fps?: number;
        bit?: number;
        quality?: number;
        width?: number;
    }): Promise<any>;
    /**
     * 252 关闭视频流
     */
    stopVideoStream(): Promise<any>;
    /**
     * 299 取图片
     * @param imgType 1=jpeg, 2=webp
     */
    screenshot(options?: {
        width?: number;
        height?: number;
        qua?: number;
        scale?: number;
        x?: number;
        y?: number;
        imgType?: 1 | 2;
    }): Promise<any>;
}
