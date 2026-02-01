import { BaseIOSModule } from './base.js';
export interface GetImageFromCacheOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    qua?: number;
    scale?: number;
    imgType?: -1 | 0 | 1 | 2;
}
export interface FindColorOptions {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    children?: string;
    dir?: 0 | 1 | 2 | 3;
    sim?: number;
    num?: number;
    hold?: boolean;
}
export interface FindImageOptions {
    id?: string;
    transparent?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    sim?: number;
    method?: 0 | 1 | 2 | 3 | 4 | 5;
    hold?: boolean;
}
export interface OCROptions {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    language?: string[];
    hold?: boolean;
}
export declare class IOSAutomationModule extends BaseIOSModule {
    /**
     * 321 取界面元素节点
     */
    getUIElement(depth?: number, query?: string, stage?: number): Promise<any>;
    /**
     * 322 取系统级弹窗
     */
    getSystemAlert(): Promise<any>;
    /**
     * 398 上传图片到缓存
     */
    uploadImageToCache(data: any): Promise<any>;
    /**
     * 399 载入zip文件到缓存
     */
    loadZipToCache(path: string, password?: string): Promise<any>;
    /**
     * 400 清空缓存
     */
    clearCache(): Promise<any>;
    /**
     * 401 截图到缓存
     */
    screenshotToCache(): Promise<any>;
    /**
     * 402 缓存续期
     */
    renewCache(id: string): Promise<any>;
    /**
     * 403 释放一张图片
     */
    releaseImage(id: string): Promise<any>;
    /**
     * 404 从缓存获取图片
     */
    getImageFromCache(id: string, options?: GetImageFromCacheOptions): Promise<any>;
    /**
     * 405 缓存列表
     */
    getCacheList(): Promise<any>;
    /**
     * 406 取色
     */
    getColor(x: number, y: number, id?: string, hold?: boolean): Promise<any>;
    /**
     * 407 多点比色
     * points: "x|y|color-offset,..."
     */
    compareColors(points: string, id?: string, hold?: boolean): Promise<any>;
    /**
     * 408 找色
     */
    findColor(color: string, options?: FindColorOptions): Promise<any>;
    /**
     * 410 找图
     */
    findImage(tmpl: string | any, options?: FindImageOptions): Promise<any>;
    /**
     * 411 文字识别(OCR)
     */
    ocr(options?: OCROptions): Promise<any>;
}
