/**
 * 前端统一 WebSocket 数据订阅
 *
 * 用于订阅实时数据推送（设备列表、RPA 状态等）
 * 与 useUnifiedWebSocket 不同，这个是纯数据订阅，不用于命令交互
 */
import { ref, shallowRef, onUnmounted, computed } from 'vue'

// 设备本地状态（RPA 等）
export interface LocalDeviceState {
  rpaRunning: boolean
  rpaId?: number
  rpaName?: string
  rpaStatus?: string
  rpaStep?: number
  rpaStepName?: string
  rpaTotalSteps?: number
  rpaLoopCount?: number
  rpaLastError?: string
  rpaSubStep?: number
  rpaSubStepName?: string
}

// 带本地状态的设备
export interface DeviceWithLocal {
  deviceId: number
  serialno: string
  online: number
  deviceInfo: any
  tbYunJiUserDeviceId: number
  middleAgentDevice: any
  _local?: LocalDeviceState
}

// 推送消息格式
interface FrontendPush {
  type: string
  data: any
  time: number
}

// 服务器状态
export interface ServerStatus {
  host: string
  connected: boolean
}

// 动态获取 WebSocket 地址
const getWsUrl = () => {
  const host = window.location.hostname || '127.0.0.1'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${host}:1001/api/ws`
}

// 单例状态
let ws: WebSocket | null = null
const isConnected = ref(false)
const devices = shallowRef<DeviceWithLocal[]>([])
const rpaStatus = shallowRef<any[]>([])
const serverStatus = shallowRef<ServerStatus>({ host: '', connected: false })
const lastUpdateTime = ref(0)
const subscriptions = new Set<string>()

// 消息处理器
const messageHandlers = new Map<string, Set<(data: any) => void>>()

const connect = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  const wsUrl = getWsUrl()
  console.log('[FrontendWS] Connecting to', wsUrl)

  try {
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      isConnected.value = true
      console.log('[FrontendWS] Connected')

      // 重新订阅之前的数据类型
      subscriptions.forEach(type => {
        sendSubscribe(type)
      })
    }

    ws.onclose = () => {
      isConnected.value = false
      console.log('[FrontendWS] Disconnected')
      ws = null

      // 自动重连
      setTimeout(() => {
        if (subscriptions.size > 0) {
          connect()
        }
      }, 3000)
    }

    ws.onerror = (err) => {
      console.error('[FrontendWS] Error', err)
    }

    ws.onmessage = (event) => {
      try {
        const push: FrontendPush = JSON.parse(event.data)
        lastUpdateTime.value = push.time

        // 更新内部状态
        switch (push.type) {
          case 'devices':
            devices.value = push.data || []
            break
          case 'rpa_status':
            rpaStatus.value = push.data || []
            break
          case 'server_status':
            serverStatus.value = push.data || { host: '', connected: false }
            break
        }

        // 调用注册的处理器
        const handlers = messageHandlers.get(push.type)
        if (handlers) {
          handlers.forEach(handler => handler(push.data))
        }
      } catch (e) {
        console.error('[FrontendWS] Parse Error', e)
      }
    }
  } catch (e) {
    console.error('[FrontendWS] Connection Failed', e)
  }
}

const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
    isConnected.value = false
  }
}

const sendSubscribe = (dataType: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  ws.send(JSON.stringify({ type: 'subscribe', data: dataType }))
}

const sendUnsubscribe = (dataType: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  ws.send(JSON.stringify({ type: 'unsubscribe', data: dataType }))
}

const sendRequest = (dataType: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  ws.send(JSON.stringify({ type: 'request', data: dataType }))
}

/**
 * 订阅数据类型
 * @param dataType 数据类型：devices, rpa_status, rpa_flows
 */
const subscribe = (dataType: string) => {
  subscriptions.add(dataType)

  if (!isConnected.value) {
    connect()
  } else {
    sendSubscribe(dataType)
  }
}

/**
 * 取消订阅
 */
const unsubscribe = (dataType: string) => {
  subscriptions.delete(dataType)
  sendUnsubscribe(dataType)

  // 如果没有订阅了，断开连接
  if (subscriptions.size === 0) {
    disconnect()
  }
}

/**
 * 注册消息处理器
 */
const onData = (dataType: string, handler: (data: any) => void) => {
  if (!messageHandlers.has(dataType)) {
    messageHandlers.set(dataType, new Set())
  }
  messageHandlers.get(dataType)!.add(handler)

  // 组件卸载时自动移除
  onUnmounted(() => {
    messageHandlers.get(dataType)?.delete(handler)
  })
}

/**
 * 获取设备的 RPA 状态
 */
const getDeviceRpaStatus = (deviceId: number): LocalDeviceState | undefined => {
  const device = devices.value.find(d => d.deviceId === deviceId)
  return device?._local
}

/**
 * 获取正在运行 RPA 的设备数量
 */
const runningRpaCount = computed(() => {
  return devices.value.filter(d => d._local?.rpaRunning).length
})

export const useFrontendWS = () => {
  return {
    // 状态
    isConnected,
    devices,
    rpaStatus,
    serverStatus,
    lastUpdateTime,
    runningRpaCount,

    // 方法
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onData,
    getDeviceRpaStatus,

    // 一次性请求
    request: sendRequest
  }
}
