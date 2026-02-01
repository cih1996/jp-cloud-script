import { IOSDeviceModule } from './device.js';
import { IOSAppModule } from './app.js';
import { IOSInputModule } from './input.js';
import { IOSFileModule } from './file.js';
import { IOSScreenModule } from './screen.js';
import { IOSAutomationModule } from './automation.js';
import { IOSSystemModule } from './system.js';
// 显式导出模块
export { IOSDeviceModule } from './device.js';
export { IOSAppModule } from './app.js';
export { IOSInputModule } from './input.js';
export { IOSFileModule } from './file.js';
export { IOSScreenModule } from './screen.js';
export { IOSAutomationModule } from './automation.js';
export { IOSSystemModule } from './system.js';
export class IOSClient {
    constructor(connection) {
        this.connection = connection;
        this.device = new IOSDeviceModule(this.connection);
        this.app = new IOSAppModule(this.connection);
        this.input = new IOSInputModule(this.connection);
        this.file = new IOSFileModule(this.connection);
        this.screen = new IOSScreenModule(this.connection);
        this.automation = new IOSAutomationModule(this.connection);
        this.system = new IOSSystemModule(this.connection);
    }
}
