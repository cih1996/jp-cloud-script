export interface TbYunJiDeviceInfo {
    UserId: number;
    brand: string;
    buyUserId: number;
    createdAt: number;
    deptId: number;
    deviceId: number;
    info: string;
    ip: string;
    online: boolean;
    onlineTime: number;
    s5info: string;
    status: number;
    tbProxyId: number;
    tbShopId: number;
    typ: number;
    updatedAt: number;
    uuid: string;
    version: string;
}
export interface TbYunjiUserDevice {
    buyType: number;
    createdAt: number;
    deviceId: number;
    deviceInfo: TbYunJiDeviceInfo;
    expiresTime: number;
    remark: string;
    tbYunJiUserDeviceId: number;
    userId: number;
    yunjiUserGroupId: number;
}
export interface PageQuerygetUserDeviceListReq {
    pageNum?: number;
    pageSize?: number;
    yunjiUserGroupId?: number;
}
export interface ConfigS5Req {
    deviceId?: number;
    s5Id?: number;
    s5Info?: string;
}
export interface PagedResultTbYunjiUserDevice {
    page: number;
    pageSize: number;
    records: TbYunjiUserDevice[];
    total: number;
    totalPages: number;
}
