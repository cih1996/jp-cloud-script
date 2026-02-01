import { BaseIOSModule } from './base.js';
export declare class IOSDeviceModule extends BaseIOSModule {
    /**
     * 4 设备信息
     */
    getDetail(): Promise<any>;
    /**
     * 149 取定位
     */
    getLocation(): Promise<any>;
    /**
     * 150 模拟定位
     */
    simulateLocation(latitude: number, longitude: number, type?: 0 | 1 | 2): Promise<any>;
    /**
     * 151 停止模拟定位
     */
    stopSimulateLocation(): Promise<any>;
    /**
     * 155 重启设备
     */
    reboot(): Promise<any>;
    /**
     * 156 抹机
     */
    wipe(): Promise<any>;
    /**
     * 157 设置语言和地区
     */
    setLanguageAndLocale(language: string, locale: string): Promise<any>;
}
