import { BaseAndroidModule } from './base.js';
export declare class AndroidDeviceModule extends BaseAndroidModule {
    /**
     * 4 设备详情
     */
    getDetail(): Promise<any>;
    /**
     * 6 上下线状态
     */
    getOnlineStatus(): Promise<any>;
    /**
     * 289 执行shell命令
     */
    executeShell(shell: string): Promise<any>;
    /**
     * 218 USB 模式切换
     */
    switchUSBMode(mode: 0 | 1): Promise<any>;
    /**
     * 219 ADB 控制
     */
    controlADB(mode: 0 | 1): Promise<any>;
    /**
     * 开启ADB Wifi调试 (端口5555)
     */
    enableAdbWifi(): Promise<any>;
    /**
     * 297 息屏
     * @param timeLong 持续时间(秒)，默认1年(31536000)
     */
    screenOff(timeLong?: number): Promise<any>;
    /**
     * 298 屏幕常亮
     * @param timeLong 持续时间(秒)，默认1年(31536000)
     */
    screenOn(timeLong?: number): Promise<any>;
    /**
     * 515 切换摄像头
     * @param type 'back' | 'front'
     */
    switchCamera(type: 'back' | 'front'): Promise<any>;
    /**
     * 516 root提权
     */
    rootGrant(pkg: string): Promise<any>;
    /**
     * 517 root去权
     */
    rootRevoke(pkg: string): Promise<any>;
    /**
     * 518 指定输入法并禁用其他输入法
     */
    setIME(imeId: string): Promise<any>;
}
