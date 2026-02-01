import { BaseAndroidModule } from './base.js';
export declare class AndroidAudioModule extends BaseAndroidModule {
    /**
     * 253 开启音频流
     */
    startAudioStream(sampleRate?: number, audioBitRate?: number): Promise<any>;
    /**
     * 254 关闭音频流
     */
    stopAudioStream(): Promise<any>;
}
