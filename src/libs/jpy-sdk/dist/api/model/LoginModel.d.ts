export interface SysUser {
    Pwd?: string;
    avatar?: string;
    createByUserId?: number;
    createTime?: number;
    deptId?: number;
    email?: string;
    isSys?: boolean;
    loginIp?: string;
    loginTime?: number;
    nickName?: string;
    phoneNumber?: string;
    remark?: string;
    sex?: number;
    status?: number;
    updateTime?: number;
    userId?: number;
    userName?: string;
    userType?: number;
}
export interface LoginUserEntity {
    token: string;
    userInfo: SysUser;
}
export interface SecretKeyLoginReq {
    secretKey: string;
}
