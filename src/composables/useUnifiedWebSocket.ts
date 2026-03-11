import { ref, onUnmounted } from 'vue'
import { useSdkStore } from '@/stores/sdkStore'

import { useDebugStore } from '@/stores/debugStore'

const isConnected = ref(false)
let ws: WebSocket | null = null
const messageHandlers = new Set<(data: any) => void>()

const connect = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  const sdkStore = useSdkStore()
  const debugStore = useDebugStore()

  // Assuming local service is on 127.0.0.1:1001
  const wsUrl = 'ws://127.0.0.1:1001/api/unified/ws'
  
  try {
    ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      isConnected.value = true
      console.log('[UnifiedWS] Connected')
      // Auto login with global key if available
      if (sdkStore.apiKey) {
        const host = localStorage.getItem('jpy_ws_host') || localStorage.getItem('last_host') || ''
        send('Login', null, { token: sdkStore.apiKey, host })
      }
    }
    
    ws.onclose = () => {
      isConnected.value = false
      console.log('[UnifiedWS] Disconnected')
      ws = null
      // Simple reconnect logic could be added here if needed
      // setTimeout(connect, 3000)
    }
    
    ws.onerror = (err) => {
      console.error('[UnifiedWS] Error', err)
      isConnected.value = false
    }
    
    ws.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data)
        
        // Log to debug store (filter out LogStream if needed, but keeping it for completeness unless filtered by view)
        // Actually, LogStream is 'return data' from backend too.
        // But let's mark it as unified-ws
        if (res.type !== 'LogStream') {
             debugStore.addLog('ws-recv', res, 'UnifiedWS')
        }
        
        messageHandlers.forEach(handler => handler(res))
      } catch (e) {
        console.error('[UnifiedWS] Parse Error', e)
      }
    }
  } catch (e) {
    console.error('[UnifiedWS] Connection Failed', e)
  }
}

const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
    isConnected.value = false
  }
}

const send = (type: string, data: any = null, extra: any = {}) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[UnifiedWS] Not connected, cannot send', type)
    return
  }
  
  const payload = {
    type,
    seq: Date.now(),
    data,
    ...extra
  }
  
  // Log send
  try {
      const debugStore = useDebugStore()
      debugStore.addLog('ws-send', payload, 'UnifiedWS')
  } catch(e) {
      // ignore
  }

  ws.send(JSON.stringify(payload))
}

const onMessage = (handler: (data: any) => void) => {
  messageHandlers.add(handler)
  onUnmounted(() => {
    messageHandlers.delete(handler)
  })
}

// Singleton state
export const useUnifiedWebSocket = () => {
  return {
    isConnected,
    connect,
    disconnect,
    send,
    onMessage
  }
}
