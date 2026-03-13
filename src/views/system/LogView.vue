<template>
  <div class="log-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('logs.title') }}</span>
          <div class="header-actions">
            <el-button 
              :type="isStreaming ? 'warning' : 'success'" 
              @click="toggleStreaming"
              :disabled="!isConnected"
            >
              <el-icon class="mr-1"><component :is="isStreaming ? VideoPause : VideoPlay" /></el-icon>
              {{ isStreaming ? $t('logs.stop') : $t('logs.start') }}
            </el-button>
            <el-button type="primary" @click="downloadLogs">
              <el-icon class="mr-1"><Download /></el-icon> {{ $t('logs.download') }}
            </el-button>
            <el-button @click="clearLogs">
              <el-icon class="mr-1"><Delete /></el-icon> {{ $t('logs.clear') }}
            </el-button>
          </div>
        </div>
      </template>
      <div class="log-container" ref="logContainer">
        <div v-if="logs.length === 0" class="empty-logs">
          {{ $t('logs.empty') }}
        </div>
        <div v-else v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import { Download, Delete, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { useUnifiedWebSocket } from '@/composables/useUnifiedWebSocket'
import { useDebugStore } from '@/stores/debugStore'


const debugStore = useDebugStore()
const logs = computed(() => debugStore.logs
  .filter(log => {
      // User requirement: Only show Unified WS traffic (send/return)
      // And LogStream (system logs) if enabled
      // Filter out 'api-req', 'api-res', and other WS traffic if distinguishable
      // We tagged UnifiedWS traffic with method='UnifiedWS' in useUnifiedWebSocket.ts
      // LogStream traffic is tagged with method='LogStream' in onMessage below
      return log.method === 'UnifiedWS' || log.method === 'LogStream'
  })
  .map(log => {
  // If it's a string, return it directly (legacy format or simple message)
  // If it's a structured LogEntry, format it nicely
  if (typeof log === 'string') return log
  
  let content = ''
  // For UnifiedWS, show full data
  if (log.method === 'UnifiedWS') {
      try {
          content = JSON.stringify(log.data)
      } catch (e) {
          content = String(log.data)
      }
  } else if (log.method === 'LogStream') {
      // LogStream data is usually a string line
      content = String(log.data)
  } else {
      // Fallback for others
      try {
          content = JSON.stringify(log.data)
      } catch (e) {
          content = String(log.data)
      }
  }
  
  return `[${log.timestamp}] [${log.type}] ${content}`
}))
const logContainer = ref<HTMLElement | null>(null)
const { isConnected, connect, send, onMessage } = useUnifiedWebSocket()
// Use computed for isStreaming to sync with store, but we need a setter to update store
const isStreaming = computed({
    get: () => debugStore.isUnifiedLogStreaming,
    set: (val) => debugStore.setUnifiedLogStreaming(val)
})

onMounted(() => {
  if (!isConnected.value) {
    connect()
  }
  // If store says streaming is ON, we should ensure backend knows it (in case of reconnect)
  if (isStreaming.value) {
      // Send start command again just in case
      // But wait for connection? 
      // If connected, send immediately.
      if (isConnected.value) {
          send('startLogStream')
      } else {
          // If not connected, it will be handled by auto-reconnect or user manual toggle
          // But ideally we should watch isConnected
      }
  }
})

// Watch for connection changes to auto-start streaming if enabled
watch(isConnected, (val) => {
  if (val && isStreaming.value) {
    send('startLogStream')
  }
})

onUnmounted(() => {
  // Stop backend streaming to save bandwidth when leaving this view
  // But keep store state "ON" so it resumes when we return
  if (isStreaming.value && isConnected.value) {
      send('stopLogStream')
  }
})

const toggleStreaming = () => {
  if (isStreaming.value) {
    // User wants to turn it OFF permanently
    isStreaming.value = false // Updates store
    send('stopLogStream')
  } else {
    // User wants to turn it ON
    isStreaming.value = true // Updates store
    send('startLogStream')
  }
}

// Listen for log stream
onMessage((res) => {
  if (res.type === 'LogStream') {

    debugStore.addLog('ws-push', res.data, 'LogStream')
    scrollToBottom()
  }
})

const scrollToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  debugStore.clearLogs()
}

const downloadLogs = () => {
  // 动态获取后端地址
  const host = window.location.hostname || '127.0.0.1'
  window.open(`http://${host}:1001/api/logs/download`, '_blank')
}
</script>

<style scoped lang="scss">
.log-view {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  :deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.log-item {
  border-bottom: 1px solid #333;
  padding-bottom: 2px;
  margin-bottom: 2px;
  word-break: break-all;
}

.empty-logs {
  color: #666;
  text-align: center;
  margin-top: 20px;
}

.mr-1 {
  margin-right: 4px;
}
</style>
