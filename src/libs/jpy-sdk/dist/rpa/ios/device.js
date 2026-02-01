import { BaseIOSModule } from './base.js';
import { Func, Protoc } from '../consts.js';
export class IOSDeviceModule extends BaseIOSModule {
    /**
     * 4 设备信息
     */
    async getDetail() {
        return await this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncDevice, data: {} });
    }
    /**
     * 149 取定位
     */
    async getLocation() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, { f: Func.FuncGetLocation, data: {} });
    }
    /**
     * 150 模拟定位
     */
    async simulateLocation(latitude, longitude, type = 0) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncSimulateLocation,
            data: { seat: this.deviceId, latitude, longitude, type }
        });
    }
    /**
     * 151 停止模拟定位
     */
    async stopSimulateLocation() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncStopSimulateLocation,
            data: { seat: this.deviceId }
        });
    }
    /**
     * 155 重启设备
     */
    async reboot() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncRebootDevice,
            data: { seat: this.deviceId }
        });
    }
    /**
     * 156 抹机
     */
    async wipe() {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncWipeDevice,
            data: { seat: this.deviceId }
        });
    }
    /**
     * 157 设置语言和地区
     */
    async setLanguageAndLocale(language, locale) {
        return this.connection.call(Protoc.TypeMsgpack, 0n, {
            f: Func.FuncSetLanguageLocale,
            data: { seat: this.deviceId, language, locale }
        });
    }
}
