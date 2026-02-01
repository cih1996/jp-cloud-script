import { AndroidDeviceModule } from './device.js';
import { AndroidAppModule } from './app.js';
import { AndroidInputModule } from './input.js';
import { AndroidScreenModule } from './screen.js';
import { AndroidAudioModule } from './audio.js';
import { AndroidFileModule } from './file.js';
export class AndroidClient {
    constructor(connection) {
        this.connection = connection;
        this.device = new AndroidDeviceModule(this.connection);
        this.app = new AndroidAppModule(this.connection);
        this.input = new AndroidInputModule(this.connection);
        this.screen = new AndroidScreenModule(this.connection);
        this.audio = new AndroidAudioModule(this.connection);
        this.file = new AndroidFileModule(this.connection);
    }
}
// 导出相关模块
export { AndroidDeviceModule } from './device.js';
export { AndroidAppModule } from './app.js';
export { AndroidInputModule } from './input.js';
export { AndroidScreenModule } from './screen.js';
export { AndroidAudioModule } from './audio.js';
export { AndroidFileModule } from './file.js';
