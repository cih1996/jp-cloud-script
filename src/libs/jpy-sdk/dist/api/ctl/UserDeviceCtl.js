export class UserDeviceCtlApi {
    constructor(sendInterface) {
        this._app = "userDeviceCtl";
        this.sendInterface = sendInterface;
    }
    getUserDeviceList(data) {
        return this.sendInterface.sendFun(this._app, "getUserDeviceList", data);
    }
    configS5(data) {
        return this.sendInterface.sendFun(this._app, "configS5", data);
    }
}
