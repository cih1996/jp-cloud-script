import { BaseIOSModule } from './base.js';
export interface TouchPoint {
    id: number;
    type: 0 | 1 | 2;
    x: number;
    y: number;
    offset: number;
    pressure: number;
}
export declare class IOSInputModule extends BaseIOSModule {
    /**
     * 257 触摸(绝对坐标)
     */
    touchAbsolute(points: TouchPoint[]): Promise<any>;
    /**
     * 258 触摸(相对坐标)
     */
    touchRelative(points: TouchPoint[]): Promise<any>;
    /**
     * 281 按键(home/音量加减)
     * keyCode: 64=home, 233=音量+, 234=音量-
     * action: 0=按下，1=抬起，3=按下延迟50ms后抬起
     */
    pressKey(keyCode: number, action?: number, usage?: number): Promise<any>;
    /**
     * 769 输入文本
     */
    inputText(text: string): Promise<any>;
}
