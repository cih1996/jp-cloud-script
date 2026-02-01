export const errorCode = {
    "unknown": 0,
    "success": 1,
    "notConnect": 2,
    "notOnline": 3,
    "formatError": 4,
    "timeout": 5
};
const errorMessages = {
    en: {
        [errorCode.unknown]: "unknown error",
        [errorCode.success]: "success",
        [errorCode.notConnect]: "not connect",
        [errorCode.notOnline]: "device not online",
        [errorCode.formatError]: "data format error",
        [errorCode.timeout]: "task timeout",
    }
};
export function errorMsg(code) {
    return errorMessages["en"][code] || "unknown error.";
}
export function newError(code) {
    return { code: code, msg: errorMsg(code) };
}
