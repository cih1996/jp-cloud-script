import { SendInterface } from "../../muxws/SendInterface.js";
import { PageQuerygetUserDeviceListReq, PagedResultTbYunjiUserDevice, ConfigS5Req } from "../model/DeviceModel.js";
export declare class UserDeviceCtlApi {
    _app: string;
    sendInterface: SendInterface;
    constructor(sendInterface: SendInterface);
    getUserDeviceList(data: Partial<PageQuerygetUserDeviceListReq>): Promise<PagedResultTbYunjiUserDevice>;
    configS5(data: Partial<ConfigS5Req>): Promise<any>;
}
