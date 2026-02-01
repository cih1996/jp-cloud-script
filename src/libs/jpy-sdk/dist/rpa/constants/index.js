/**
 * 中间件业务功能代码 (f 字段)
 */
export var BusinessFunction;
(function (BusinessFunction) {
    // 设备信息与状态
    BusinessFunction[BusinessFunction["DEVICE_DETAIL"] = 4] = "DEVICE_DETAIL";
    BusinessFunction[BusinessFunction["DEVICE_LIST"] = 5] = "DEVICE_LIST";
    BusinessFunction[BusinessFunction["ONLINE_STATUS"] = 6] = "ONLINE_STATUS";
    BusinessFunction[BusinessFunction["SYSTEM_SYNC"] = 111] = "SYSTEM_SYNC";
    BusinessFunction[BusinessFunction["SCREEN_ROTATION"] = 250] = "SCREEN_ROTATION";
    // 定位相关
    BusinessFunction[BusinessFunction["GET_LOCATION"] = 149] = "GET_LOCATION";
    BusinessFunction[BusinessFunction["SIMULATE_LOCATION"] = 150] = "SIMULATE_LOCATION";
    BusinessFunction[BusinessFunction["STOP_SIMULATE_LOCATION"] = 151] = "STOP_SIMULATE_LOCATION";
    // 设备控制 (Mirror)
    BusinessFunction[BusinessFunction["REBOOT_DEVICE"] = 155] = "REBOOT_DEVICE";
    BusinessFunction[BusinessFunction["WIPE_DEVICE"] = 156] = "WIPE_DEVICE";
    BusinessFunction[BusinessFunction["SET_LANGUAGE_LOCALE"] = 157] = "SET_LANGUAGE_LOCALE";
    BusinessFunction[BusinessFunction["POWER_CONTROL_MIRROR"] = 217] = "POWER_CONTROL_MIRROR";
    BusinessFunction[BusinessFunction["SWITCH_USB_MODE_MIRROR"] = 218] = "SWITCH_USB_MODE_MIRROR";
    BusinessFunction[BusinessFunction["CONTROL_ADB_MIRROR"] = 219] = "CONTROL_ADB_MIRROR";
    BusinessFunction[BusinessFunction["SCREEN_OFF"] = 297] = "SCREEN_OFF";
    BusinessFunction[BusinessFunction["SCREEN_ON"] = 298] = "SCREEN_ON";
    BusinessFunction[BusinessFunction["SWITCH_CAMERA"] = 515] = "SWITCH_CAMERA";
    BusinessFunction[BusinessFunction["ROOT_GRANT"] = 516] = "ROOT_GRANT";
    BusinessFunction[BusinessFunction["ROOT_REVOKE"] = 517] = "ROOT_REVOKE";
    BusinessFunction[BusinessFunction["SET_IME"] = 518] = "SET_IME";
    // App 管理
    BusinessFunction[BusinessFunction["GET_APP_LIST"] = 290] = "GET_APP_LIST";
    BusinessFunction[BusinessFunction["START_APP"] = 291] = "START_APP";
    BusinessFunction[BusinessFunction["KILL_APP"] = 292] = "KILL_APP";
    BusinessFunction[BusinessFunction["UNINSTALL_APP"] = 159] = "UNINSTALL_APP";
    BusinessFunction[BusinessFunction["GET_FOREGROUND_APP"] = 320] = "GET_FOREGROUND_APP";
    // 触摸与按键
    BusinessFunction[BusinessFunction["TOUCH_ABSOLUTE"] = 257] = "TOUCH_ABSOLUTE";
    BusinessFunction[BusinessFunction["TOUCH_RELATIVE"] = 258] = "TOUCH_RELATIVE";
    BusinessFunction[BusinessFunction["SCROLL"] = 259] = "SCROLL";
    BusinessFunction[BusinessFunction["PRESS_KEY"] = 281] = "PRESS_KEY";
    BusinessFunction[BusinessFunction["INPUT_TEXT"] = 769] = "INPUT_TEXT";
    BusinessFunction[BusinessFunction["GET_CLIPBOARD"] = 770] = "GET_CLIPBOARD";
    // Shell 执行
    BusinessFunction[BusinessFunction["EXECUTE_SHELL"] = 289] = "EXECUTE_SHELL";
    // 下载管理
    BusinessFunction[BusinessFunction["ADD_DOWNLOAD_TASK"] = 293] = "ADD_DOWNLOAD_TASK";
    BusinessFunction[BusinessFunction["GET_CURRENT_DOWNLOAD_TASK"] = 294] = "GET_CURRENT_DOWNLOAD_TASK";
    BusinessFunction[BusinessFunction["CANCEL_DOWNLOAD_TASK"] = 295] = "CANCEL_DOWNLOAD_TASK";
    BusinessFunction[BusinessFunction["GET_DOWNLOAD_LIST"] = 296] = "GET_DOWNLOAD_LIST";
    // 文件操作
    BusinessFunction[BusinessFunction["FILE_TRANSFER_START"] = 301] = "FILE_TRANSFER_START";
    BusinessFunction[BusinessFunction["FILE_TRANSFER_UPLOAD"] = 302] = "FILE_TRANSFER_UPLOAD";
    BusinessFunction[BusinessFunction["FILE_TRANSFER_CANCEL"] = 303] = "FILE_TRANSFER_CANCEL";
    BusinessFunction[BusinessFunction["LIST_FILES"] = 304] = "LIST_FILES";
    BusinessFunction[BusinessFunction["GET_FILE_INFO"] = 305] = "GET_FILE_INFO";
    BusinessFunction[BusinessFunction["MOVE_FILE"] = 306] = "MOVE_FILE";
    BusinessFunction[BusinessFunction["DELETE_FILE"] = 307] = "DELETE_FILE";
    BusinessFunction[BusinessFunction["COPY_TO_PHOTOS"] = 308] = "COPY_TO_PHOTOS";
    BusinessFunction[BusinessFunction["FILE_DOWNLOAD_START"] = 309] = "FILE_DOWNLOAD_START";
    BusinessFunction[BusinessFunction["FILE_DOWNLOAD_CHUNK"] = 310] = "FILE_DOWNLOAD_CHUNK";
    BusinessFunction[BusinessFunction["UNZIP_FILE"] = 311] = "UNZIP_FILE";
    // UI 与系统
    BusinessFunction[BusinessFunction["GET_TOP_APP"] = 320] = "GET_TOP_APP";
    BusinessFunction[BusinessFunction["FIND_NODE"] = 321] = "FIND_NODE";
    BusinessFunction[BusinessFunction["FIND_DIALOG"] = 322] = "FIND_DIALOG";
    BusinessFunction[BusinessFunction["OPEN_URL"] = 323] = "OPEN_URL";
    BusinessFunction[BusinessFunction["TTS"] = 324] = "TTS";
    BusinessFunction[BusinessFunction["TOAST"] = 325] = "TOAST";
    BusinessFunction[BusinessFunction["GET_APP_WEBVIEW_URL"] = 326] = "GET_APP_WEBVIEW_URL";
    // 外部请求与脚本
    BusinessFunction[BusinessFunction["HTTP_REQUEST"] = 500] = "HTTP_REQUEST";
    BusinessFunction[BusinessFunction["EXECUTE_JS_SCRIPT"] = 510] = "EXECUTE_JS_SCRIPT";
    BusinessFunction[BusinessFunction["EXECUTE_JS_SCRIPT_FILE"] = 511] = "EXECUTE_JS_SCRIPT_FILE";
    // 截图与图像操作
    BusinessFunction[BusinessFunction["SCREENSHOT"] = 299] = "SCREENSHOT";
    BusinessFunction[BusinessFunction["VIDEO_STREAM_START"] = 251] = "VIDEO_STREAM_START";
    BusinessFunction[BusinessFunction["VIDEO_STREAM_STOP"] = 252] = "VIDEO_STREAM_STOP";
    BusinessFunction[BusinessFunction["AUDIO_STREAM_START"] = 253] = "AUDIO_STREAM_START";
    BusinessFunction[BusinessFunction["AUDIO_STREAM_STOP"] = 254] = "AUDIO_STREAM_STOP";
    BusinessFunction[BusinessFunction["UPLOAD_IMAGE_CACHE"] = 398] = "UPLOAD_IMAGE_CACHE";
    BusinessFunction[BusinessFunction["UPLOAD_IMAGE_ZIP_CACHE"] = 399] = "UPLOAD_IMAGE_ZIP_CACHE";
    BusinessFunction[BusinessFunction["CLEAN_IMAGE_CACHE"] = 400] = "CLEAN_IMAGE_CACHE";
    BusinessFunction[BusinessFunction["SCREENSHOT_TO_CACHE"] = 401] = "SCREENSHOT_TO_CACHE";
    BusinessFunction[BusinessFunction["RENEW_IMAGE_CACHE"] = 402] = "RENEW_IMAGE_CACHE";
    BusinessFunction[BusinessFunction["RELEASE_IMAGE_CACHE"] = 403] = "RELEASE_IMAGE_CACHE";
    BusinessFunction[BusinessFunction["GET_IMAGE_FROM_CACHE"] = 404] = "GET_IMAGE_FROM_CACHE";
    BusinessFunction[BusinessFunction["GET_CACHE_LIST"] = 405] = "GET_CACHE_LIST";
    BusinessFunction[BusinessFunction["GET_COLOR"] = 406] = "GET_COLOR";
    BusinessFunction[BusinessFunction["COMPARE_COLORS"] = 407] = "COMPARE_COLORS";
    BusinessFunction[BusinessFunction["FIND_COLOR"] = 408] = "FIND_COLOR";
    BusinessFunction[BusinessFunction["FIND_IMAGE_OLD"] = 409] = "FIND_IMAGE_OLD";
    BusinessFunction[BusinessFunction["FIND_IMAGE"] = 410] = "FIND_IMAGE";
    BusinessFunction[BusinessFunction["OCR"] = 411] = "OCR";
    BusinessFunction[BusinessFunction["SWITCH_USB_MODE"] = 106] = "SWITCH_USB_MODE";
    BusinessFunction[BusinessFunction["POWER_CONTROL"] = 107] = "POWER_CONTROL";
    BusinessFunction[BusinessFunction["FORCE_FLASH_ROM"] = 108] = "FORCE_FLASH_ROM";
    BusinessFunction[BusinessFunction["ENABLE_ADB"] = 109] = "ENABLE_ADB";
    BusinessFunction[BusinessFunction["GET_ROM_PACKAGES"] = 113] = "GET_ROM_PACKAGES";
    BusinessFunction[BusinessFunction["QUERY_FLASH_STATUS"] = 117] = "QUERY_FLASH_STATUS";
    BusinessFunction[BusinessFunction["FLASH_ROM_PROGRESS"] = 118] = "FLASH_ROM_PROGRESS";
    BusinessFunction[BusinessFunction["FLASH_ROM"] = 119] = "FLASH_ROM";
    BusinessFunction[BusinessFunction["TERMINAL_INIT"] = 9] = "TERMINAL_INIT";
    BusinessFunction[BusinessFunction["DELETE_ROM_PACKAGE"] = 114] = "DELETE_ROM_PACKAGE";
})(BusinessFunction || (BusinessFunction = {}));
export var MessageType;
(function (MessageType) {
    MessageType[MessageType["PONG"] = 2] = "PONG";
    MessageType[MessageType["PING"] = 1] = "PING";
    MessageType[MessageType["VIDEO"] = 9] = "VIDEO";
    MessageType[MessageType["MSGPACK"] = 5] = "MSGPACK";
    MessageType[MessageType["JSON"] = 7] = "JSON";
})(MessageType || (MessageType = {}));
