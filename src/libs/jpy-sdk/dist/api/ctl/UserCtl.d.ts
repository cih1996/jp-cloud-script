import { SendInterface } from "../../muxws/SendInterface.js";
import { SetLoginTypeReq, SetLoginTypeRes } from "../model/UserModel.js";
export declare class UserCtlApi {
    _app: string;
    sendInterface: SendInterface;
    constructor(sendInterface: SendInterface);
    setLoginType(data: Partial<SetLoginTypeReq>): Promise<SetLoginTypeRes>;
}
