import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidAppModule extends BaseAndroidModule {
    /**
     * 290 取应用列表
     */
    async getList() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetAppList, data: null });
    }
    /**
     * 291 启动应用
     */
    async start(packageName) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncStartApp, data: { packageName } });
    }
}
