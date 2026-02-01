import { SendInterface } from "../../muxws/SendInterface.js";
import { SecretKeyLoginReq, LoginUserEntity } from "../model/LoginModel.js";
export declare class LoginCtlApi {
    _app: string;
    sendInterface: SendInterface;
    constructor(sendInterface: SendInterface);
    secretKeyLogin(data: Partial<SecretKeyLoginReq>): Promise<LoginUserEntity>;
}
