import { BaseIOSModule } from './base.js';
export declare class IOSFileModule extends BaseIOSModule {
    /**
     * 293 添加下载任务
     */
    addDownloadTask(url: string, name?: string, sha256?: string): Promise<any>;
    /**
     * 294 取当前下载任务
     */
    getCurrentDownloadTask(): Promise<any>;
    /**
     * 295 取消下载任务
     */
    cancelDownloadTask(taskId: string): Promise<any>;
    /**
     * 296 取下载列表
     */
    getDownloadList(): Promise<any>;
    /**
     * 304 文件列表
     */
    listFiles(path: string): Promise<any>;
    /**
     * 305 文件信息
     */
    getFileInfo(path: string): Promise<any>;
    /**
     * 306 文件移动
     */
    moveFile(srcPath: string, dstPath: string): Promise<any>;
    /**
     * 307 文件删除
     */
    deleteFile(path: string): Promise<any>;
    /**
     * 308 拷贝到相册
     */
    copyToPhotos(path: string): Promise<any>;
    /**
     * 311 解压zip文件
     */
    unzipFile(srcPath: string, dstPath: string, password?: string): Promise<any>;
    /**
     * 301 文件直传开始(用户-->手机)
     */
    startUpload(path: string, size: number, toPhotos?: boolean): Promise<any>;
    /**
     * 302 文件直传发送块(用户-->手机)
     */
    uploadChunk(id: number, offset: number, payload: any): Promise<any>;
    /**
     * 309 文件直传开始(手机-->用户)
     */
    startDownload(path: string): Promise<any>;
    /**
     * 310 文件直传接收块(手机-->用户)
     */
    downloadChunk(id: number, offset: number): Promise<any>;
    /**
     * 303 取消文件直传任务
     */
    cancelTransfer(id: number): Promise<any>;
}
