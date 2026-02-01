import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSAutomationModule extends BaseIOSModule {
    /**
     * 321 取界面元素节点
     */
    async getUIElement(depth = 50, query = "", stage = 0) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncFindNode,
            data: { depth, query, stage }
        });
    }
    /**
     * 322 取系统级弹窗
     */
    async getSystemAlert() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncFindDialog, data: {} });
    }
    /**
     * 398 上传图片到缓存
     */
    async uploadImageToCache(data) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncTransferPic, data });
    }
    /**
     * 399 载入zip文件到缓存
     */
    async loadZipToCache(path, password) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncTransferPicZip,
            data: { path, password }
        });
    }
    /**
     * 400 清空缓存
     */
    async clearCache() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncCleanCache, data: {} });
    }
    /**
     * 401 截图到缓存
     */
    async screenshotToCache() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncScreenshotHold, data: {} });
    }
    /**
     * 402 缓存续期
     */
    async renewCache(id) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncRenewPic, data: { id } });
    }
    /**
     * 403 释放一张图片
     */
    async releaseImage(id) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncReleasePic, data: { id } });
    }
    /**
     * 404 从缓存获取图片
     */
    async getImageFromCache(id, options = {}) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncGetPicById,
            data: { id, ...options }
        });
    }
    /**
     * 405 缓存列表
     */
    async getCacheList() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncCached, data: {} });
    }
    /**
     * 406 取色
     */
    async getColor(x, y, id = "", hold = false) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncGetColor,
            data: { id, x, y, hold }
        });
    }
    /**
     * 407 多点比色
     * points: "x|y|color-offset,..."
     */
    async compareColors(points, id = "", hold = false) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncCmpColor,
            data: { id, points, hold }
        });
    }
    /**
     * 408 找色
     */
    async findColor(color, options = {}) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncFindColor,
            data: { color, ...options }
        });
    }
    /**
     * 410 找图
     */
    async findImage(tmpl, options = {}) {
        // 410 in consts.ts is FuncFindPicEx
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncFindPicEx,
            data: { tmpl, ...options }
        });
    }
    /**
     * 411 文字识别(OCR)
     */
    async ocr(options = {}) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncOCR, data: options });
    }
}
