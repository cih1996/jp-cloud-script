export class LoginCtlApi {
    constructor(sendInterface) {
        this._app = "loginCtl";
        this.sendInterface = sendInterface;
    }
    secretKeyLogin(data) {
        return this.sendInterface.sendFun(this._app, "secretKeyLogin", data);
    }
}
