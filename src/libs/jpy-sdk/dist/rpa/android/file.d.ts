import { BaseAndroidModule } from './base.js';
export declare class AndroidFileModule extends BaseAndroidModule {
    /**
     * 293 文件下载安装
     */
    downloadAndInstall(url: string, name: string, sha256: string): Promise<any>;
    /**
     * 294 查询文件下载进度
     */
    getDownloadProgress(id: string): Promise<any>;
}
