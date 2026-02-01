export interface ListReq {
    hash?: string;
    fileName?: string;
}
export interface ListRes {
    fileId: number;
    fileName: string;
    addTime: number;
    userId: number;
    hash: string;
    size: number;
    delTime: number;
}
export interface GetUploadUrlReq {
    hash: string;
    fileName: string;
}
export interface AddCosFileReq {
    hash: string;
    fileName: string;
}
export interface DelReq {
    fileIds: number[];
}
export interface FastUploadReq {
    hash: string;
    fileName: string;
}
