import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSFileModule extends BaseIOSModule {
    /**
     * 293 添加下载任务
     */
    async addDownloadTask(url, name, sha256) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncAddDownloadTask,
            data: { url, name, sha256 }
        });
    }
    /**
     * 294 取当前下载任务
     */
    async getCurrentDownloadTask() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetCurrentDownloadTask, data: {} });
    }
    /**
     * 295 取消下载任务
     */
    async cancelDownloadTask(taskId) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncCancelDownloadTask,
            data: { taskId }
        });
    }
    /**
     * 296 取下载列表
     */
    async getDownloadList() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetDownloadList, data: {} });
    }
    /**
     * 304 文件列表
     */
    async listFiles(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncFileList, data: { path } });
    }
    /**
     * 305 文件信息
     */
    async getFileInfo(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncFileStat, data: { path } });
    }
    /**
     * 306 文件移动
     */
    async moveFile(srcPath, dstPath) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncFileMove,
            data: { srcPath, dstPath }
        });
    }
    /**
     * 307 文件删除
     */
    async deleteFile(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncFileDelete, data: { path } });
    }
    /**
     * 308 拷贝到相册
     */
    async copyToPhotos(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncToPhotos, data: { path } });
    }
    /**
     * 311 解压zip文件
     */
    async unzipFile(srcPath, dstPath, password) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncUnzipFile,
            data: { srcPath, dstPath, password }
        });
    }
    /**
     * 301 文件直传开始(用户-->手机)
     */
    async startUpload(path, size, toPhotos = false) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTransferStart,
            data: { path, size, toPhotos }
        });
    }
    /**
     * 302 文件直传发送块(用户-->手机)
     */
    async uploadChunk(id, offset, payload) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTransferFile,
            data: { id, offset, payload }
        });
    }
    /**
     * 309 文件直传开始(手机-->用户)
     */
    async startDownload(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncDownFileBegin,
            data: { path }
        });
    }
    /**
     * 310 文件直传接收块(手机-->用户)
     */
    async downloadChunk(id, offset) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncDownFileChunk,
            data: { id, offset }
        });
    }
    /**
     * 303 取消文件直传任务
     */
    async cancelTransfer(id) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTransferCancel,
            data: { id }
        });
    }
}
