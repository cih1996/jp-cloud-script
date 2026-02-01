export interface SetLoginTypeReq {
    forceLogin: boolean;
    loginType: string;
    token: string;
}
export interface SetLoginTypeRes {
    isLogin: boolean;
}
