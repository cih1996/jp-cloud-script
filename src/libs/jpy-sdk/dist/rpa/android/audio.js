import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidAudioModule extends BaseAndroidModule {
    /**
     * 253 开启音频流
     */
    async startAudioStream(sampleRate = 48000, audioBitRate = 128000) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncStartAudio,
            data: { sampleRate, audioBitRate }
        });
    }
    /**
     * 254 关闭音频流
     */
    async stopAudioStream() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncStopAudio, data: null });
    }
}
