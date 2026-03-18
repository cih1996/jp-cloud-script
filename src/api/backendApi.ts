/**
 * 后端 API 封装
 * 所有请求都通过 go-port-trans 后端，不直连集控平台
 */

// 动态获取后端地址
const getBaseUrl = () => {
    const host = window.location.hostname || '127.0.0.1'
    return `http://${host}:1001`
}

// 统一请求方法
const callUnified = async (type: string, data?: any, extra?: any) => {
    const res = await fetch(`${getBaseUrl()}/api/unified`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type,
            seq: Date.now(),
            data,
            ...extra
        })
    })
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
    const json = await res.json()
    if (json.code !== 200) {
        throw new Error(json.msg || 'Request failed')
    }
    return json.data
}

export const backendApi = {
    // 获取设备列表
    async getDeviceList() {
        return await callUnified('GetDeviceList')
    },

    // 获取云文件列表
    async getCloudFiles(params?: { pageNum?: number; pageSize?: number }) {
        return await callUnified('getUserFiles', params || {})
    },

    // 改机
    async changePhones(data: any[]) {
        return await callUnified('Changephones', data, { req: true })
    },

    // 获取任务状态
    async getTaskStatus(data: { funcIds: number[] }) {
        return await callUnified('getTaskStatus', data)
    },

    // 获取应用列表
    async getAppList(deviceId: number) {
        return await callUnified('getAppList', { deviceId })
    },

    // 启动应用
    async startApp(deviceId: number, packageName: string) {
        return await callUnified('startApp', { deviceId, packageName })
    },

    // 下载安装应用
    async downloadInstallApp(data: {
        devices: number[]
        url: string
        name?: string
        sha256?: string
        install?: boolean
    }) {
        return await callUnified('downLoadInstallApp', data)
    },

    // 设置代理
    async setSocket5(data: {
        deviceId: number
        s5Url: string
        nOutSwID?: number
        lineType?: number
    }) {
        return await callUnified('setSocket5', data)
    },

    // 获取代理线路
    async getS5outLine(deviceId: number) {
        return await callUnified('getS5outLine', { deviceId })
    },

    // 设置定位
    async setLocation(data: { deviceId: number; lat: number; lng: number }[]) {
        return await callUnified('setLocation', data)
    },

    // 执行 Shell 命令
    async execShell(deviceId: number, shell: string) {
        return await callUnified('execShell', { deviceId, shell })
    },

    // 隐藏应用
    async hideApp(deviceId: number, packageName: string, isHide: boolean) {
        return await callUnified('hideApp', { deviceId, packageName, isHide })
    },

    // 获取设备详情
    async getDeviceDetail(deviceId: number) {
        return await callUnified('getDeviceDetail', { deviceId })
    },

    // 获取设备状态
    async getDeviceStatus(deviceId: number) {
        return await callUnified('getDeviceStatus', { deviceId })
    },

    // 获取 Root 权限
    async getRoot(deviceId: number, pkg?: string) {
        return await callUnified('getRoot', { deviceId, pkg })
    },

    // ========== RPA 相关 API ==========

    // 获取 RPA 流程列表
    async getRpaFlows() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/flows`)
        const json = await res.json()
        return json.data
    },

    // 获取单个 RPA 流程
    async getRpaFlow(id: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/flows/${id}`)
        const json = await res.json()
        return json.data
    },

    // 创建 RPA 流程
    async createRpaFlow(flow: any) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/flows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flow)
        })
        const json = await res.json()
        return json.data
    },

    // 更新 RPA 流程
    async updateRpaFlow(id: number, flow: any) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/flows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flow)
        })
        const json = await res.json()
        return json.data
    },

    // 删除 RPA 流程
    async deleteRpaFlow(id: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/flows/${id}`, {
            method: 'DELETE'
        })
        const json = await res.json()
        return json
    },

    // 获取所有设备 RPA 配置
    async getRpaDevices() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices`)
        const json = await res.json()
        return json.data
    },

    // 获取单个设备 RPA 状态
    async getRpaDeviceStatus(deviceId: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}`)
        const json = await res.json()
        return json.data
    },

    // 绑定设备到 RPA 流程
    async bindDeviceRpa(deviceId: number, rpaId: number, mode: 'single' | 'loop' = 'single') {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/bind`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rpaId, mode })
        })
        const json = await res.json()
        return json
    },

    // 启动设备 RPA 执行
    async startDeviceRpa(deviceId: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/start`, {
            method: 'POST'
        })
        const json = await res.json()
        return json
    },

    // 暂停设备 RPA 执行
    async pauseDeviceRpa(deviceId: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/pause`, {
            method: 'POST'
        })
        const json = await res.json()
        return json
    },

    // 恢复设备 RPA 执行
    async resumeDeviceRpa(deviceId: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/resume`, {
            method: 'POST'
        })
        const json = await res.json()
        return json
    },

    // 停止设备 RPA 执行
    async stopDeviceRpa(deviceId: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/stop`, {
            method: 'POST'
        })
        const json = await res.json()
        return json
    },

    // 获取设备 RPA 日志
    async getDeviceRpaLogs(deviceId: number, limit = 100) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/logs?limit=${limit}`)
        const json = await res.json()
        return json.data
    },

    // 获取可用步骤类型
    async getRpaStepTypes() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/step-types`)
        const json = await res.json()
        return json.data
    },

    // 获取引擎状态
    async getRpaEngineStatus() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/engine/status`)
        const json = await res.json()
        return json
    },

    // 启动引擎
    async startRpaEngine() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/engine/start`, { method: 'POST' })
        const json = await res.json()
        return json
    },

    // 停止引擎
    async stopRpaEngine() {
        const res = await fetch(`${getBaseUrl()}/api/rpa/engine/stop`, { method: 'POST' })
        const json = await res.json()
        return json
    },

    // ========== 设备 WebSocket API ==========

    // 获取脚本 APK 连接的设备列表
    async getWsDevices() {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices`)
        const json = await res.json()
        return json.data
    },

    // 获取单个脚本 APK 设备信息
    async getWsDevice(deviceId: string | number) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}`)
        const json = await res.json()
        return json.data
    },

    // 请求设备截图（通过脚本 APK）
    async requestWsScreenshot(deviceId: string | number) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/screenshot`, {
            method: 'POST'
        })
        const json = await res.json()
        return json
    },

    // 获取设备截图数据
    async getWsScreenshot(deviceId: string | number) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/screenshot`)
        const json = await res.json()
        return json.data
    },

    // 发送调试脚本执行
    async sendWsDebug(deviceId: string | number, debugId: string, code: string, timeout = 30000) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/debug`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ debugId, code, timeout })
        })
        const json = await res.json()
        return json
    },

    // 获取调试执行结果
    async getWsDebugResult(deviceId: string | number, debugId: string) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/debug/${debugId}`)
        const json = await res.json()
        return json.data
    },

    // 发送命令到设备
    async sendWsCommand(deviceId: string | number, cmd: string, params?: Record<string, any>) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cmd, params })
        })
        const json = await res.json()
        return json
    },

    // 请求设备节点信息
    async requestWsNodes(deviceId: string | number, params?: { requestId?: string; windowId?: number; visibleOnly?: boolean }) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params || {})
        })
        const json = await res.json()
        return json
    },

    // 获取设备节点信息
    async getWsNodes(deviceId: string | number) {
        const res = await fetch(`${getBaseUrl()}/api/devicews/devices/${deviceId}/nodes`)
        const json = await res.json()
        return json.data
    },

    // ========== 代码仓库 API ==========

    // 获取脚本列表
    async getScripts(keyword?: string) {
        const url = keyword
            ? `${getBaseUrl()}/api/rpa/scripts?keyword=${encodeURIComponent(keyword)}`
            : `${getBaseUrl()}/api/rpa/scripts`
        const res = await fetch(url)
        const json = await res.json()
        return json.data
    },

    // 获取单个脚本
    async getScript(id: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/scripts/${id}`)
        const json = await res.json()
        return json.data
    },

    // 创建脚本
    async createScript(data: { name: string; description?: string; code: string; timeout?: number }) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/scripts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const json = await res.json()
        return json.data
    },

    // 更新脚本
    async updateScript(id: number, data: { name: string; description?: string; code: string; timeout?: number }) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/scripts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const json = await res.json()
        return json.data
    },

    // 删除脚本
    async deleteScript(id: number) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/scripts/${id}`, {
            method: 'DELETE'
        })
        const json = await res.json()
        return json
    },

    // ========== RPA 执行历史 API ==========

    // 获取所有执行历史
    async getRpaHistory(limit = 50) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/history?limit=${limit}`)
        const json = await res.json()
        return json.data
    },

    // 获取设备执行历史
    async getDeviceRpaHistory(deviceId: number, limit = 20) {
        const res = await fetch(`${getBaseUrl()}/api/rpa/devices/${deviceId}/history?limit=${limit}`)
        const json = await res.json()
        return json.data
    }
}
