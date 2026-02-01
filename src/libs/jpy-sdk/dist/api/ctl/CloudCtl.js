export class CloudCtlApi {
    constructor(sendInterface) {
        this._app = "tbFileCtl";
        this.sendInterface = sendInterface;
    }
    list(data) {
        return this.sendInterface.sendFun(this._app, "list", data);
    }
    getUploadUrl(data) {
        return this.sendInterface.sendFun(this._app, "getUploadUrl", data);
    }
    addCosFile(data) {
        return this.sendInterface.sendFun(this._app, "addCosFile", data);
    }
    del(data) {
        return this.sendInterface.sendFun(this._app, "del", data);
    }
    fastUpload(data) {
        return this.sendInterface.sendFun(this._app, "fastUpload", data);
    }
    getDownloadUrl() {
        return this.sendInterface.sendFun(this._app, "getDownloadUrl", null);
    }
}
