import WebSocket from 'isomorphic-ws';
import { WsConn } from './muxws/WsConn.js';
import { SendInterface } from './muxws/SendInterface.js';
import { LoginCtlApi } from './api/ctl/LoginCtl.js';
import { UserCtlApi } from './api/ctl/UserCtl.js';
import { UserDeviceCtlApi } from './api/ctl/UserDeviceCtl.js';
import { CloudCtlApi } from './api/ctl/CloudCtl.js';
import { ChangeOsCtlApi } from './api/ctl/ChangeOsCtl.js';
export * from './muxws/Conn.js';
export * from './muxws/WsConn.js';
export * from './muxws/Mux.js';
export * from './muxws/SendInterface.js';
export * from './api/model/LoginModel.js';
export * from './api/model/UserModel.js';
export * from './api/model/DeviceModel.js';
export * from './api/model/CloudModel.js';
export * from './api/model/ChangeOsModel.js';
export * from './api/ctl/LoginCtl.js';
export * from './api/ctl/UserCtl.js';
export * from './api/ctl/UserDeviceCtl.js';
export * from './api/ctl/CloudCtl.js';
export * from './api/ctl/ChangeOsCtl.js';
// RPA Exports
export * from './rpa/rpaClient.js';
export * from './rpa/android/index.js';
export * from './rpa/ios/index.js'; // Optional but good to have
export class JpySdk {
    constructor(url) {
        const ws = new WebSocket(url);
        this.conn = new WsConn(ws);
        this.sendInterface = new SendInterface(this.conn);
        this.loginCtl = new LoginCtlApi(this.sendInterface);
        this.userCtl = new UserCtlApi(this.sendInterface);
        this.userDeviceCtl = new UserDeviceCtlApi(this.sendInterface);
        this.cloudCtl = new CloudCtlApi(this.sendInterface);
        this.changeOsCtl = new ChangeOsCtlApi(this.sendInterface);
    }
    /**
     * Helper to close the connection
     */
    close() {
        this.conn.close();
    }
}
