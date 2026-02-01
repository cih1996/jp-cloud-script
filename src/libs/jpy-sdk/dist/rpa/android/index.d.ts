import { RPAClient } from '../rpaClient.js';
import { AndroidDeviceModule } from './device.js';
import { AndroidAppModule } from './app.js';
import { AndroidInputModule } from './input.js';
import { AndroidScreenModule } from './screen.js';
import { AndroidAudioModule } from './audio.js';
import { AndroidFileModule } from './file.js';
export declare class AndroidClient {
    readonly device: AndroidDeviceModule;
    readonly app: AndroidAppModule;
    readonly input: AndroidInputModule;
    readonly screen: AndroidScreenModule;
    readonly audio: AndroidAudioModule;
    readonly file: AndroidFileModule;
    private connection;
    constructor(connection: RPAClient);
}
export { AndroidDeviceModule } from './device.js';
export { AndroidAppModule } from './app.js';
export { AndroidInputModule } from './input.js';
export { AndroidScreenModule } from './screen.js';
export { AndroidAudioModule } from './audio.js';
export { AndroidFileModule } from './file.js';
