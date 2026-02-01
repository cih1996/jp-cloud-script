import { BaseIOSModule } from './base.js';
export interface HttpRequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    proxy?: string;
    headers?: string[];
    body?: any;
    timeout?: number;
    skipVerify?: boolean;
}
export declare class IOSSystemModule extends BaseIOSModule {
    /**
     * 323 内置浏览框URL跳转
     */
    openUrl(url: string): Promise<any>;
    /**
     * 324 Siri语音指令
     */
    siri(text: string): Promise<any>;
    /**
     * 325 发送通知
     */
    sendNotification(text: string): Promise<any>;
    /**
     * 500 http请求
     */
    httpRequest(options: HttpRequestOptions): Promise<any>;
    /**
     * 510 执行js脚本
     */
    executeScript(text: string): Promise<any>;
    /**
     * 511 执行js脚本文件
     */
    executeScriptFile(path: string): Promise<any>;
}
