import { BaseAndroidModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class AndroidDeviceModule extends BaseAndroidModule {
    /**
     * 4 设备详情
     */
    async getDetail() {
        return await this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncDevice, data: null });
    }
    /**
     * 6 上下线状态
     */
    async getOnlineStatus() {
        return await this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncOnlineList, data: null });
    }
    /**
     * 289 执行shell命令
     */
    async executeShell(shell) {
        if (!shell || !shell.trim())
            throw new Error('Shell命令不能为空');
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncCMDWithResult, data: { shell: shell.trim() } });
    }
    /**
     * 218 USB 模式切换
     */
    async switchUSBMode(mode) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncSwitchUsbMode, data: { mode } });
    }
    /**
     * 219 ADB 控制
     */
    async controlADB(mode) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncControlAdb, data: { mode } });
    }
    /**
     * 开启ADB Wifi调试 (端口5555)
     */
    async enableAdbWifi() {
        return this.executeShell('su -c "setprop service.adb.tcp.port 5555 && stop adbd && start adbd && settings put global adb_enabled 1"');
    }
    /**
     * 关闭ADB Wifi调试
     */
    async disableAdbWifi() {
        return this.executeShell('su -c "setprop service.adb.tcp.port -1 && stop adbd && settings put global adb_enabled 0"');
    }
    /**
     * 297 息屏
     * @param timeLong 持续时间(秒)，默认1年(31536000)
     */
    async screenOff(timeLong = 31536000) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncScreenOff,
            data: { state: "off", timeLong }
        });
    }
    /**
     * 298 屏幕常亮
     * @param timeLong 持续时间(秒)，默认1年(31536000)
     */
    async screenOn(timeLong = 31536000) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncScreenOn,
            data: { state: "on", timeLong }
        });
    }
    /**
     * 515 切换摄像头
     * @param type 'back' | 'front'
     */
    async switchCamera(type) {
        const params = type === 'back' ? { switchBack: null } : { switchFront: null };
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncSwitchCamera,
            data: { type: "setting", params }
        });
    }
    /**
     * 516 root提权
     */
    async rootGrant(pkg) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncRootGrant, data: { pkg } });
    }
    /**
     * 517 root去权
     */
    async rootRevoke(pkg) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncRootRevoke, data: { pkg } });
    }
    /**
     * 518 指定输入法并禁用其他输入法
     */
    async setIME(imeId) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncSetIME, data: { imeId } });
    }
}
