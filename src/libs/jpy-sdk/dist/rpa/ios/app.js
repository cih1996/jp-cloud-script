import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSAppModule extends BaseIOSModule {
    /**
     * 290 取app列表
     */
    async getList(type = 'user') {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncGetAppList,
            data: { seat: this.deviceId, type }
        });
    }
    /**
     * 159 卸载app
     */
    async uninstall(bundleId) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncUninstallApp,
            data: { seat: this.deviceId, bundleId }
        });
    }
    /**
     * 291 启动app
     */
    async start(packageName) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncStartApp,
            data: { packageName }
        });
    }
    /**
     * 292 杀死app
     */
    async kill(packageName) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncKillApp,
            data: { packageName }
        });
    }
    /**
     * 320 取前台app
     */
    async getForegroundApp() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncTopApp, data: {} });
    }
    /**
     * 323 内置浏览框URL跳转
     */
    async openUrl(url) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncURL, data: { url } });
    }
    /**
     * 326 取app浏览框的当前URL
     */
    async getWebviewUrl() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetAppWebviewUrl, data: {} });
    }
}
