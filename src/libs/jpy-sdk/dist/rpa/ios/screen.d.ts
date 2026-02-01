import { BaseIOSModule } from './base.js';
export interface ScreenshotOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    qua: number;
    scale?: number;
    imgType?: 0 | 1 | 2;
}
export declare class IOSScreenModule extends BaseIOSModule {
    /**
     * 299 截图
     */
    screenshot(options?: ScreenshotOptions): Promise<any>;
}
