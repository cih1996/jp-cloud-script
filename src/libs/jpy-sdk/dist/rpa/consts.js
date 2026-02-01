export var Protoc;
(function (Protoc) {
    Protoc[Protoc["TypePing"] = 1] = "TypePing";
    Protoc[Protoc["TypePong"] = 2] = "TypePong";
    Protoc[Protoc["TypeTestDelayRequest"] = 3] = "TypeTestDelayRequest";
    Protoc[Protoc["TypeTestDelayResponse"] = 4] = "TypeTestDelayResponse";
    Protoc[Protoc["TypeBinary"] = 5] = "TypeBinary";
    Protoc[Protoc["TypeMsgpack"] = 6] = "TypeMsgpack";
    Protoc[Protoc["TypeJson"] = 7] = "TypeJson";
    Protoc[Protoc["TypeText"] = 8] = "TypeText";
    Protoc[Protoc["TypeVideo"] = 9] = "TypeVideo";
    Protoc[Protoc["TypeAudio"] = 10] = "TypeAudio";
    Protoc[Protoc["TypeSpeedTest"] = 11] = "TypeSpeedTest";
    Protoc[Protoc["TypeSecretMsgpack"] = 12] = "TypeSecretMsgpack";
    Protoc[Protoc["TypeTerminal"] = 13] = "TypeTerminal"; //字符终端流
})(Protoc || (Protoc = {}));
export var Func;
(function (Func) {
    Func[Func["FuncTestDelay"] = 1] = "FuncTestDelay";
    Func[Func["FuncAddPermit"] = 2] = "FuncAddPermit";
    Func[Func["FuncDelPermit"] = 3] = "FuncDelPermit";
    Func[Func["FuncDevice"] = 4] = "FuncDevice";
    Func[Func["FuncDevices"] = 5] = "FuncDevices";
    Func[Func["FuncOnlineList"] = 6] = "FuncOnlineList";
    Func[Func["FuncTunnel"] = 7] = "FuncTunnel";
    Func[Func["FuncLogin"] = 8] = "FuncLogin";
    Func[Func["FuncTerm"] = 9] = "FuncTerm";
    Func[Func["FuncVersionSequence"] = 10] = "FuncVersionSequence";
    Func[Func["FuncPlugins"] = 11] = "FuncPlugins";
    Func[Func["FuncDevice2Version"] = 12] = "FuncDevice2Version";
    Func[Func["FuncMgtDevices"] = 13] = "FuncMgtDevices";
    Func[Func["FuncBatchCommand"] = 14] = "FuncBatchCommand";
    Func[Func["FuncExit"] = 15] = "FuncExit";
    Func[Func["FuncPortMap"] = 16] = "FuncPortMap";
    Func[Func["FuncPortTunnel"] = 17] = "FuncPortTunnel";
    Func[Func["FuncFileServer"] = 100] = "FuncFileServer";
    Func[Func["FuncBroadcastInfo"] = 101] = "FuncBroadcastInfo";
    Func[Func["FuncPreSetting"] = 102] = "FuncPreSetting";
    Func[Func["FuncGetSettingByHid"] = 103] = "FuncGetSettingByHid";
    Func[Func["FuncGetSettingByPreSetting"] = 104] = "FuncGetSettingByPreSetting";
    Func[Func["FuncDeviceVersion"] = 105] = "FuncDeviceVersion";
    Func[Func["FuncHidSwitchMode"] = 106] = "FuncHidSwitchMode";
    Func[Func["FuncHidPower"] = 107] = "FuncHidPower";
    Func[Func["FuncHidFastboot"] = 108] = "FuncHidFastboot";
    Func[Func["FuncHidFind"] = 109] = "FuncHidFind";
    Func[Func["FuncHidWriteDefaultScript"] = 110] = "FuncHidWriteDefaultScript";
    Func[Func["FuncGetWorkMode"] = 111] = "FuncGetWorkMode";
    Func[Func["FuncFlashSubscribe"] = 112] = "FuncFlashSubscribe";
    Func[Func["FuncImageList"] = 113] = "FuncImageList";
    Func[Func["FuncImageDelete"] = 114] = "FuncImageDelete";
    Func[Func["FuncFlashLogList"] = 115] = "FuncFlashLogList";
    Func[Func["FuncFlashTaskDetail"] = 116] = "FuncFlashTaskDetail";
    Func[Func["FuncFlashList"] = 117] = "FuncFlashList";
    Func[Func["FuncFlashTask"] = 118] = "FuncFlashTask";
    Func[Func["FuncFlashTaskAdd"] = 119] = "FuncFlashTaskAdd";
    Func[Func["FuncFlashTaskRemove"] = 120] = "FuncFlashTaskRemove";
    Func[Func["FuncFlashTaskAction"] = 121] = "FuncFlashTaskAction";
    Func[Func["FuncScreenChange"] = 250] = "FuncScreenChange";
    Func[Func["FuncStartVideo"] = 251] = "FuncStartVideo";
    Func[Func["FuncStopVideo"] = 252] = "FuncStopVideo";
    Func[Func["FuncStartAudio"] = 253] = "FuncStartAudio";
    Func[Func["FuncStopAudio"] = 254] = "FuncStopAudio";
    Func[Func["FuncAuth"] = 255] = "FuncAuth";
    Func[Func["FuncTouchAbs"] = 257] = "FuncTouchAbs";
    Func[Func["FuncTouch"] = 258] = "FuncTouch";
    Func[Func["FuncScroll"] = 259] = "FuncScroll";
    Func[Func["FuncKey"] = 281] = "FuncKey";
    Func[Func["FuncCMD"] = 288] = "FuncCMD";
    Func[Func["FuncCMDWithResult"] = 289] = "FuncCMDWithResult";
    Func[Func["FuncWakeup"] = 297] = "FuncWakeup";
    Func[Func["FuncWakeupAlways"] = 298] = "FuncWakeupAlways";
    Func[Func["FuncImg"] = 299] = "FuncImg";
    Func[Func["FuncTransferStart"] = 301] = "FuncTransferStart";
    Func[Func["FuncTransferFile"] = 302] = "FuncTransferFile";
    Func[Func["FuncTransferCancel"] = 303] = "FuncTransferCancel";
    Func[Func["FuncFileList"] = 304] = "FuncFileList";
    Func[Func["FuncFileStat"] = 305] = "FuncFileStat";
    Func[Func["FuncFileMove"] = 306] = "FuncFileMove";
    Func[Func["FuncFileDelete"] = 307] = "FuncFileDelete";
    Func[Func["FuncToPhotos"] = 308] = "FuncToPhotos";
    Func[Func["FuncDownFileBegin"] = 309] = "FuncDownFileBegin";
    Func[Func["FuncDownFileChunk"] = 310] = "FuncDownFileChunk";
    Func[Func["FuncTopApp"] = 320] = "FuncTopApp";
    Func[Func["FuncFindNode"] = 321] = "FuncFindNode";
    Func[Func["FuncFindDialog"] = 322] = "FuncFindDialog";
    Func[Func["FuncURL"] = 323] = "FuncURL";
    Func[Func["FuncTTS"] = 324] = "FuncTTS";
    Func[Func["FuncToast"] = 325] = "FuncToast";
    Func[Func["FuncTransferPic"] = 398] = "FuncTransferPic";
    Func[Func["FuncTransferPicZip"] = 399] = "FuncTransferPicZip";
    Func[Func["FuncCleanCache"] = 400] = "FuncCleanCache";
    Func[Func["FuncScreenshotHold"] = 401] = "FuncScreenshotHold";
    Func[Func["FuncRenewPic"] = 402] = "FuncRenewPic";
    Func[Func["FuncReleasePic"] = 403] = "FuncReleasePic";
    Func[Func["FuncGetPicById"] = 404] = "FuncGetPicById";
    Func[Func["FuncCached"] = 405] = "FuncCached";
    Func[Func["FuncGetColor"] = 406] = "FuncGetColor";
    Func[Func["FuncCmpColor"] = 407] = "FuncCmpColor";
    Func[Func["FuncFindColor"] = 408] = "FuncFindColor";
    Func[Func["FuncFindPic"] = 409] = "FuncFindPic";
    Func[Func["FuncFindPicEx"] = 410] = "FuncFindPicEx";
    Func[Func["FuncOCR"] = 411] = "FuncOCR";
    Func[Func["FuncHttp"] = 500] = "FuncHttp";
    Func[Func["FuncOSInfo"] = 501] = "FuncOSInfo";
    Func[Func["FuncInputText"] = 769] = "FuncInputText";
    Func[Func["FuncGetClipBoard"] = 770] = "FuncGetClipBoard";
    Func[Func["FuncSetClipBoard"] = 771] = "FuncSetClipBoard";
    // New additions from SDK
    Func[Func["FuncGetAppList"] = 290] = "FuncGetAppList";
    Func[Func["FuncStartApp"] = 291] = "FuncStartApp";
    Func[Func["FuncKillApp"] = 292] = "FuncKillApp";
    Func[Func["FuncAddDownloadTask"] = 293] = "FuncAddDownloadTask";
    Func[Func["FuncGetCurrentDownloadTask"] = 294] = "FuncGetCurrentDownloadTask";
    Func[Func["FuncCancelDownloadTask"] = 295] = "FuncCancelDownloadTask";
    Func[Func["FuncGetDownloadList"] = 296] = "FuncGetDownloadList";
    Func[Func["FuncScreenOff"] = 297] = "FuncScreenOff";
    Func[Func["FuncScreenOn"] = 298] = "FuncScreenOn";
    // FuncScreenshot    = 299, // Already FuncImg
    Func[Func["FuncSwitchUsbMode"] = 218] = "FuncSwitchUsbMode";
    Func[Func["FuncControlAdb"] = 219] = "FuncControlAdb";
    Func[Func["FuncSwitchCamera"] = 515] = "FuncSwitchCamera";
    Func[Func["FuncRootGrant"] = 516] = "FuncRootGrant";
    Func[Func["FuncRootRevoke"] = 517] = "FuncRootRevoke";
    Func[Func["FuncSetIME"] = 518] = "FuncSetIME";
    Func[Func["FuncGetLocation"] = 149] = "FuncGetLocation";
    Func[Func["FuncSimulateLocation"] = 150] = "FuncSimulateLocation";
    Func[Func["FuncStopSimulateLocation"] = 151] = "FuncStopSimulateLocation";
    Func[Func["FuncRebootDevice"] = 155] = "FuncRebootDevice";
    Func[Func["FuncWipeDevice"] = 156] = "FuncWipeDevice";
    Func[Func["FuncSetLanguageLocale"] = 157] = "FuncSetLanguageLocale";
    Func[Func["FuncUninstallApp"] = 159] = "FuncUninstallApp";
    Func[Func["FuncGetAppWebviewUrl"] = 326] = "FuncGetAppWebviewUrl";
    Func[Func["FuncExecuteJsScript"] = 510] = "FuncExecuteJsScript";
    Func[Func["FuncExecuteJsScriptFile"] = 511] = "FuncExecuteJsScriptFile";
    Func[Func["FuncUnzipFile"] = 311] = "FuncUnzipFile";
})(Func || (Func = {}));
export const keyCode = {
    action: {
        down: 0,
        up: 1,
        downAndUp: 3,
        mouseDown: 0,
        mouseMove: 2,
        mouserUp: 1,
        wheel: 8,
        ctrl: 4
    },
    soundPlus: 24,
    soundReduce: 25,
    backspace: 67,
    enter: 66,
    up: 19,
    down: 20,
    left: 21,
    right: 22,
    delete: 112,
    home: 3,
    menu: 187,
    back: 4,
    power: 26,
    mouse: 2,
    ctrl: 4096,
    keyUp: 19,
    keyDown: 20,
    fileDownload: 999,
    A: 29,
    C: 31,
    X: 52,
    fileDownLoadAndInstall: 1000
};
export const keyMap = new Map([
    // =============== 字母键 (A-Z) ===============
    ["KeyA", 29],
    ["KeyB", 30],
    ["KeyC", 31],
    ["KeyD", 32],
    ["KeyE", 33],
    ["KeyF", 34],
    ["KeyG", 35],
    ["KeyH", 36],
    ["KeyI", 37],
    ["KeyJ", 38],
    ["KeyK", 39],
    ["KeyL", 40],
    ["KeyM", 41],
    ["KeyN", 42],
    ["KeyO", 43],
    ["KeyP", 44],
    ["KeyQ", 45],
    ["KeyR", 46],
    ["KeyS", 47],
    ["KeyT", 48],
    ["KeyU", 49],
    ["KeyV", 50],
    ["KeyW", 51],
    ["KeyX", 52],
    ["KeyY", 53],
    ["KeyZ", 54],
    // =============== 数字键 (0-9) ===============
    ["Digit0", 7],
    ["Digit1", 8],
    ["Digit2", 9],
    ["Digit3", 10],
    ["Digit4", 11],
    ["Digit5", 12],
    ["Digit6", 13],
    ["Digit7", 14],
    ["Digit8", 15],
    ["Digit9", 16],
    // =============== 功能键 ===============
    ["Enter", 66], // 回车键
    ["Escape", 111], // ESC键
    ["Backspace", 67], // 退格键
    ["Tab", 61], // Tab键
    ["Space", 62], // 空格键
    ["CapsLock", 115], // 大写锁定
    ["ShiftLeft", 59], // 左Shift
    ["ShiftRight", 60], // 右Shift
    ["ControlLeft", 113], // 左Ctrl
    ["ControlRight", 114], // 右Ctrl
    ["AltLeft", 57], // 左Alt
    ["AltRight", 58], // 右Alt
    ["MetaLeft", 117], // 左Win/Cmd
    ["MetaRight", 118], // 右Win/Cmd
    ["ContextMenu", 117], // 菜单键
    // =============== 方向键 ===============
    ["ArrowUp", 19],
    ["ArrowDown", 20],
    ["ArrowLeft", 21],
    ["ArrowRight", 22],
    // =============== 符号键 ===============
    ["Backquote", 68], // `~
    ["Minus", 69], // -_
    ["Equal", 70], // =+
    ["BracketLeft", 71], // [{
    ["BracketRight", 72], // ]}
    ["Backslash", 73], // \|
    ["Semicolon", 74], // ;:
    ["Quote", 75], // '"
    ["Comma", 55], // ,<
    ["Period", 56], // .>
    ["Slash", 76], // /?
    // =============== 数字小键盘 ===============
    ["NumLock", 143],
    ["Numpad0", 144],
    ["Numpad1", 145],
    ["Numpad2", 146],
    ["Numpad3", 147],
    ["Numpad4", 148],
    ["Numpad5", 149],
    ["Numpad6", 150],
    ["Numpad7", 151],
    ["Numpad8", 152],
    ["Numpad9", 153],
    ["NumpadAdd", 157], // 小键盘+
    ["NumpadSubtract", 156], // 小键盘-
    ["NumpadMultiply", 155], // 小键盘*
    ["NumpadDivide", 154], // 小键盘/
    ["NumpadEnter", 160], // 小键盘回车
    ["NumpadDecimal", 158], // 小键盘.
    // =============== 功能键区 (F1-F12) ===============
    ["F1", 131],
    ["F2", 132],
    ["F3", 133],
    ["F4", 134],
    ["F5", 135],
    ["F6", 136],
    ["F7", 137],
    ["F8", 138],
    ["F9", 139],
    ["F10", 140],
    ["F11", 141],
    ["F12", 142],
    // =============== 编辑键 ===============
    ["PrintScreen", 120], // 打印屏幕
    ["ScrollLock", 116], // 滚动锁定
    ["Pause", 121], // 暂停键
    ["Insert", 124], // Insert键
    ["Home", 122], // Home键
    ["PageUp", 92], // PageUp
    ["Delete", 112], // Delete键
    ["End", 123], // End键
    ["PageDown", 93], // PageDown
    // =============== 多媒体键 ===============
    ["AudioVolumeUp", 24], // 音量+
    ["AudioVolumeDown", 25], // 音量-
    ["AudioVolumeMute", 164], // 静音
    ["MediaPlayPause", 85], // 播放/暂停
    ["MediaStop", 86], // 停止
    ["MediaNext", 87], // 下一曲
    ["MediaPrevious", 88], // 上一曲
    // =============== 安卓特有键 ===============
    ["Camera", 27], // 相机键
    ["Call", 5], // 拨号键
    ["EndCall", 6], // 挂断键
    ["Explorer", 64], // 浏览器键
    ["Envelope", 65], // 邮件键
    ["Search", 84] // 搜索键
]);
