import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSSystemModule extends BaseIOSModule {
    /**
     * 323 内置浏览框URL跳转
     */
    async openUrl(url) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncURL, data: { url } });
    }
    /**
     * 324 Siri语音指令
     */
    async siri(text) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncTTS, data: { text } });
    }
    /**
     * 325 发送通知
     */
    async sendNotification(text) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncToast, data: { text } });
    }
    /**
     * 500 http请求
     */
    async httpRequest(options) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncHttp, data: options });
    }
    /**
     * 510 执行js脚本
     */
    async executeScript(text) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncExecuteJsScript, data: { text } });
    }
    /**
     * 511 执行js脚本文件
     */
    async executeScriptFile(path) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncExecuteJsScriptFile, data: { path } });
    }
}
