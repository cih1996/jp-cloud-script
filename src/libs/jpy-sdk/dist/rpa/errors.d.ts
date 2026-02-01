export declare const errorCode: {
    unknown: number;
    success: number;
    notConnect: number;
    notOnline: number;
    formatError: number;
    timeout: number;
};
export declare function errorMsg(code: number): string;
export declare function newError(code: number): {
    code: number;
    msg: string;
};
