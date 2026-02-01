export class UserCtlApi {
    constructor(sendInterface) {
        this._app = "userCtl";
        this.sendInterface = sendInterface;
    }
    setLoginType(data) {
        return this.sendInterface.sendFun(this._app, "setLoginType", data);
    }
}
