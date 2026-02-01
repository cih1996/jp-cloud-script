import { BaseAndroidModule } from './base.js';
export declare class AndroidAppModule extends BaseAndroidModule {
    /**
     * 290 取应用列表
     */
    getList(): Promise<any>;
    /**
     * 291 启动应用
     */
    start(packageName: string): Promise<any>;
}
