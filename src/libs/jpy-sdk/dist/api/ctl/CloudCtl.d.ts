import { SendInterface } from "../../muxws/SendInterface.js";
import { AddCosFileReq, DelReq, FastUploadReq, GetUploadUrlReq, ListReq, ListRes } from "../model/CloudModel.js";
export declare class CloudCtlApi {
    _app: string;
    sendInterface: SendInterface;
    constructor(sendInterface: SendInterface);
    list(data: Partial<ListReq>): Promise<ListRes[]>;
    getUploadUrl(data: GetUploadUrlReq): Promise<string>;
    addCosFile(data: AddCosFileReq): Promise<void>;
    del(data: DelReq): Promise<void>;
    fastUpload(data: FastUploadReq): Promise<boolean>;
    getDownloadUrl(): Promise<string>;
}
