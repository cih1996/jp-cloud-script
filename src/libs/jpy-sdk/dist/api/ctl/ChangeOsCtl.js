export class ChangeOsCtlApi {
    constructor(sendInterface) {
        this._app = "changeOsCtl";
        this.sendInterface = sendInterface;
    }
    changeOs(data) {
        return this.sendInterface.sendFun(this._app, "changeOs", data);
    }
    getChangeOsStatus(data) {
        return this.sendInterface.sendFun(this._app, "getChangeOsStatus", data);
    }
}
