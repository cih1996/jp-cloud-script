import { BaseIOSModule } from './base.js';
export declare class IOSAppModule extends BaseIOSModule {
    /**
     * 290 取app列表
     */
    getList(type?: 'any' | 'system' | 'internal' | 'user'): Promise<any>;
    /**
     * 159 卸载app
     */
    uninstall(bundleId: string): Promise<any>;
    /**
     * 291 启动app
     */
    start(packageName: string): Promise<any>;
    /**
     * 292 杀死app
     */
    kill(packageName: string): Promise<any>;
    /**
     * 320 取前台app
     */
    getForegroundApp(): Promise<any>;
    /**
     * 323 内置浏览框URL跳转
     */
    openUrl(url: string): Promise<any>;
    /**
     * 326 取app浏览框的当前URL
     */
    getWebviewUrl(): Promise<any>;
}
