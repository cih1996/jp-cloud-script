export interface ChangeOsReq {
    deviceId: number;
    bs: string;
    category: string;
    version: string;
    country: string;
    language: string;
    timezone: string;
    operatorName: string;
    mcc: string;
    mnc: string;
    operator: string;
    msisdn: string;
    smsc: string;
}
export interface ChangeOsRes {
    id: number;
}
export interface GetChangeOsStatusReq {
    tbChangeOsIds: number[];
}
export interface GetChangeOsStatusRes {
    id: number;
    deviceId: number;
    status: number;
    progress: string;
    createTime: number;
    updateTime: number;
}
