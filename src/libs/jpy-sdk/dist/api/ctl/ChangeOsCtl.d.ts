import { SendInterface } from "../../muxws/SendInterface.js";
import { ChangeOsReq, ChangeOsRes, GetChangeOsStatusReq, GetChangeOsStatusRes } from "../model/ChangeOsModel.js";
export declare class ChangeOsCtlApi {
    _app: string;
    sendInterface: SendInterface;
    constructor(sendInterface: SendInterface);
    changeOs(data: ChangeOsReq[]): Promise<ChangeOsRes[]>;
    getChangeOsStatus(data: GetChangeOsStatusReq): Promise<GetChangeOsStatusRes[]>;
}
