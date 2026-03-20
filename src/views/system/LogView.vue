<template>
  <div class="log-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-tabs v-model="activeTab" @tab-change="onTabChange">
            <el-tab-pane label="系统日志" name="system" />
            <el-tab-pane label="设备通信(1003)" name="devicews" />
            <el-tab-pane label="API调用(1002)" name="api" />
          </el-tabs>
          <div class="header-actions">
            <!-- 系统日志 tab 操作 -->
            <template v-if="activeTab === 'system'">
              <el-button
                :type="isStreaming ? 'warning' : 'success'"
                @click="toggleStreaming"
                :disabled="!isConnected"
                size="small"
              >
                <el-icon class="mr-1"><component :is="isStreaming ? VideoPause : VideoPlay" /></el-icon>
                {{ isStreaming ? '停止' : '开始' }}
              </el-button>
              <el-button type="primary" size="small" @click="downloadLogs">
                <el-icon class="mr-1"><Download /></el-icon> 下载
              </el-button>
            </template>
            <!-- 设备通信 tab 操作 -->
            <template v-if="activeTab === 'devicews'">
              <el-input
                v-model="dwsKeyword"
                placeholder="关键词过滤"
                size="small"
                style="width: 160px"
                clearable
                @keyup.enter="fetchDeviceWSLogs"
              />
              <el-select v-model="dwsLines" size="small" style="width: 100px">
                <el-option :value="100" label="100行" />
                <el-option :value="200" label="200行" />
                <el-option :value="500" label="500行" />
                <el-option :value="1000" label="1000行" />
              </el-select>
              <el-button type="primary" size="small" @click="fetchDeviceWSLogs" :loading="dwsLoading">
                <el-icon class="mr-1"><Refresh /></el-icon> 刷新
              </el-button>
              <el-switch
                v-model="dwsAutoRefresh"
                active-text="自动"
                size="small"
                style="margin-left: 8px"
              />
            </template>
            <!-- API调用 tab 操作 -->
            <template v-if="activeTab === 'api'">
              <el-input
                v-model="apiKeyword"
                placeholder="关键词过滤"
                size="small"
                style="width: 160px"
                clearable
                @keyup.enter="fetchAPILogs"
              />
              <el-select v-model="apiLines" size="small" style="width: 100px">
                <el-option :value="100" label="100行" />
                <el-option :value="200" label="200行" />
                <el-option :value="500" label="500行" />
                <el-option :value="1000" label="1000行" />
              </el-select>
              <el-button type="primary" size="small" @click="fetchAPILogs" :loading="apiLoading">
                <el-icon class="mr-1"><Refresh /></el-icon> 刷新
              </el-button>
              <el-switch
                v-model="apiAutoRefresh"
                active-text="自动"
                size="small"
                style="margin-left: 8px"
              />
            </template>
            <el-button size="small" @click="clearCurrentLogs">
              <el-icon class="mr-1"><Delete /></el-icon> 清空
            </el-button>
          </div>
        </div>
      </template>

      <div class="log-container" ref="logContainer">
        <!-- 系统日志 -->
        <template v-if="activeTab === 'system'">
          <div v-if="systemLogs.length === 0" class="empty-logs">暂无系统日志</div>
          <div v-else v-for="(log, index) in systemLogs" :key="index" class="log-item">{{ log }}</div>
        </template>
        <!-- 设备日志 -->
        <template v-if="activeTab === 'devicews'">
          <div v-if="dwsLogs.length === 0" class="empty-logs">
            {{ dwsLoading ? '加载中...' : '暂无设备日志，点击刷新获取' }}
          </div>
          <div v-else v-for="(log, index) in dwsLogs" :key="index"
               class="log-item" :class="getLogLevel(log)">
            {{ log }}
          </div>
        </template>
        <!-- API 日志 -->
        <template v-if="activeTab === 'api'">
          <div v-if="apiLogs.length === 0" class="empty-logs">
            {{ apiLoading ? '加载中...' : '暂无API日志，点击刷新获取' }}
          </div>
          <div v-else v-for="(log, index) in apiLogs" :key="index"
               class="log-item" :class="getLogLevel(log)">
            {{ log }}
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import { Download, Delete, VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue'
import { useUnifiedWebSocket } from '@/composables/useUnifiedWebSocket'
import { useDebugStore } from '@/stores/debugStore'
import { backendApi } from '@/api/backendApi'

const debugStore = useDebugStore()
const logContainer = ref<HTMLElement | null>(null)
const activeTab = ref('devicews')

// ===== 系统日志 =====
const systemLogs = computed(() => debugStore.logs
  .filter(log => log.method === 'UnifiedWS' || log.method === 'LogStream')
  .map(log => {
    if (typeof log === 'string') return log
    let content = ''
    if (log.method === 'UnifiedWS') {
      try { content = JSON.stringify(log.data) } catch { content = String(log.data) }
    } else if (log.method === 'LogStream') {
      content = String(log.data)
    } else {
      try { content = JSON.stringify(log.data) } catch { content = String(log.data) }
    }
    return `[${log.timestamp}] [${log.type}] ${content}`
  }))

const { isConnected, connect, send, onMessage } = useUnifiedWebSocket()
const isStreaming = computed({
  get: () => debugStore.isUnifiedLogStreaming,
  set: (val) => debugStore.setUnifiedLogStreaming(val)
})

// ===== 设备日志 =====
const dwsLogs = ref<string[]>([])
const dwsKeyword = ref('')
const dwsLines = ref(200)
const dwsLoading = ref(false)
const dwsAutoRefresh = ref(false)
let dwsTimer: ReturnType<typeof setInterval> | null = null

// ===== API 日志 =====
const apiLogs = ref<string[]>([])
const apiKeyword = ref('')
const apiLines = ref(200)
const apiLoading = ref(false)
const apiAutoRefresh = ref(false)
let apiTimer: ReturnType<typeof setInterval> | null = null

const fetchDeviceWSLogs = async () => {
  dwsLoading.value = true
  try {
    const result = await backendApi.queryLogs({
      type: 'devicews',
      lines: dwsLines.value,
      keyword: dwsKeyword.value || undefined
    })
    dwsLogs.value = result?.logs || []
    scrollToBottom()
  } catch (e: any) {
    console.error('查询设备日志失败:', e)
  } finally {
    dwsLoading.value = false
  }
}

const fetchAPILogs = async () => {
  apiLoading.value = true
  try {
    const result = await backendApi.queryLogs({
      type: 'api',
      lines: apiLines.value,
      keyword: apiKeyword.value || undefined
    })
    apiLogs.value = result?.logs || []
    scrollToBottom()
  } catch (e: any) {
    console.error('查询API日志失败:', e)
  } finally {
    apiLoading.value = false
  }
}

const getLogLevel = (line: string): string => {
  if (line.includes('[ERROR]')) return 'log-error'
  if (line.includes('[WARN]')) return 'log-warn'
  if (line.includes('[DEBUG]')) return 'log-debug'
  return ''
}

// 自动刷新
watch(dwsAutoRefresh, (val) => {
  if (val) {
    dwsTimer = setInterval(fetchDeviceWSLogs, 3000)
  } else if (dwsTimer) {
    clearInterval(dwsTimer)
    dwsTimer = null
  }
})

watch(apiAutoRefresh, (val) => {
  if (val) {
    apiTimer = setInterval(fetchAPILogs, 3000)
  } else if (apiTimer) {
    clearInterval(apiTimer)
    apiTimer = null
  }
})

// ===== 通用 =====
const onTabChange = (tab: string) => {
  if (tab === 'devicews' && dwsLogs.value.length === 0) {
    fetchDeviceWSLogs()
  }
  if (tab === 'api' && apiLogs.value.length === 0) {
    fetchAPILogs()
  }
}

const clearCurrentLogs = () => {
  if (activeTab.value === 'system') {
    debugStore.clearLogs()
  } else if (activeTab.value === 'devicews') {
    dwsLogs.value = []
  } else if (activeTab.value === 'api') {
    apiLogs.value = []
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

const toggleStreaming = () => {
  if (isStreaming.value) {
    isStreaming.value = false
    send('stopLogStream')
  } else {
    isStreaming.value = true
    send('startLogStream')
  }
}

const downloadLogs = () => {
  const host = window.location.hostname || '127.0.0.1'
  window.open(`http://${host}:1001/api/logs/download`, '_blank')
}

onMounted(() => {
  if (!isConnected.value) connect()
  if (isStreaming.value && isConnected.value) send('startLogStream')
  // 默认加载设备日志
  if (activeTab.value === 'devicews') fetchDeviceWSLogs()
})

watch(isConnected, (val) => {
  if (val && isStreaming.value) send('startLogStream')
})

onMessage((res) => {
  if (res.type === 'LogStream') {
    debugStore.addLog('ws-push', res.data, 'LogStream')
    if (activeTab.value === 'system') scrollToBottom()
  }
})

onUnmounted(() => {
  if (isStreaming.value && isConnected.value) send('stopLogStream')
  if (dwsTimer) { clearInterval(dwsTimer); dwsTimer = null }
  if (apiTimer) { clearInterval(apiTimer); apiTimer = null }
})
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

  :deep(.el-card__header) {
    padding: 8px 16px;
  }
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

  :deep(.el-tabs) {
    margin-bottom: 0;
    .el-tabs__header { margin: 0; }
    .el-tabs__nav-wrap::after { display: none; }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
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

  &.log-error { color: #f56c6c; }
  &.log-warn { color: #e6a23c; }
  &.log-debug { color: #909399; }
}

.empty-logs {
  color: #666;
  text-align: center;
  margin-top: 20px;
}

.mr-1 { margin-right: 4px; }
</style>
