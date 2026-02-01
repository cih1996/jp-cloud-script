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
export * from './rpa/rpaClient.js';
export * from './rpa/android/index.js';
export * from './rpa/ios/index.js';
export declare class JpySdk {
    conn: WsConn;
    sendInterface: SendInterface;
    loginCtl: LoginCtlApi;
    userCtl: UserCtlApi;
    userDeviceCtl: UserDeviceCtlApi;
    cloudCtl: CloudCtlApi;
    changeOsCtl: ChangeOsCtlApi;
    constructor(url: string);
    /**
     * Helper to close the connection
     */
    close(): void;
}
