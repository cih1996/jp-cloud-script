import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidFileModule extends BaseAndroidModule {
    /**
     * 293 文件下载安装
     */
    async downloadAndInstall(url, name, sha256) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncAddDownloadTask,
            data: { url, name, sha256, install: true, receive: true }
        });
    }
    /**
     * 294 查询文件下载进度
     */
    async getDownloadProgress(id) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncGetCurrentDownloadTask,
            data: { id }
        });
    }
}
