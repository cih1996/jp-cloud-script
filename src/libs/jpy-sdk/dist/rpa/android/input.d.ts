import { BaseAndroidModule } from './base.js';
export declare class AndroidInputModule extends BaseAndroidModule {
    /**
     * 258 触屏（鼠标）
     * @param type 0按下 1抬起 2移动
     * @param id 手指编号
     * @param pressure 压力值 0~1
     */
    touch(type: 0 | 1 | 2, x: number, y: number, id?: number, pressure?: number, offset?: number): Promise<any>;
    /**
     * 259 滚轮
     * @param upOrDown -1向下，1向上
     */
    scroll(upOrDown: -1 | 1, x: number, y: number): Promise<any>;
    /**
     * 281 按键
     * @param action 0按下 1抬起 3按下并抬起 4组合ctrl键
     */
    pressKey(keyCode: number, action?: 0 | 1 | 3 | 4): Promise<any>;
    /**
     * 769 输入文本
     */
    inputText(text: string): Promise<any>;
    /**
     * 770 获取剪切板内容
     */
    getClipboard(): Promise<any>;
}
