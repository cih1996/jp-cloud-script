<!-- 
  接口调用调试面板 
-->
<template>
  <div class="unified-test-view">
    <!-- Top Connection Bar -->
    <el-card class="connection-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('testView.connection') }}</span>
          <div class="status-indicator" :class="{ connected: isConnected }"></div>
        </div>
      </template>
      <el-form :inline="true">
        <el-form-item :label="$t('testView.wsUrl')">
          <el-input v-model="wsUrl" style="width: 300px" />
        </el-form-item>
        <el-form-item label="Heartbeat">
          <el-switch v-model="heartbeatEnabled" />
        </el-form-item>
        <el-form-item label="Interval(ms)">
          <el-input-number v-model="heartbeatIntervalMs" :min="1000" :step="1000" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="connect" :disabled="isConnected">{{ $t('testView.connect') }}</el-button>
          <el-button type="danger" @click="disconnect" :disabled="!isConnected">{{ $t('testView.disconnect') }}</el-button>
          <el-button @click="sendHeartbeat" :disabled="!isConnected">Ping</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="main-content">
      <el-tabs v-model="topActiveTab" class="top-level-tabs" type="border-card">
        <el-tab-pane label="Debug Console" name="debug">
          <div class="content-flex-container">
            <!-- Left Column: Function Tabs -->
            <div class="left-panel">
              <el-tabs tab-position="left" v-model="activeTab" style="height: 100%;" class="function-tabs">
                <el-tab-pane :label="$t('testView.login')" name="login">
                  <div class="action-panel">
                    <el-form label-width="80px">
                      <el-form-item :label="$t('testView.token')">
                        <el-input v-model="token" placeholder="Enter Token" type="textarea" :rows="3" />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="sendLogin">{{ $t('testView.login') }}</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getDeviceList')" name="getDeviceList">
                  <el-button type="primary" @click="sendGetDeviceList">{{ $t('testView.getList') }}</el-button>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getAppList')" name="getAppList">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.tbDeviceId')">
                      <el-input-number v-model="formData.tbDeviceId" :min="1" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getAppList')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.startApp')" name="startApp">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.package')">
                      <el-input v-model="formData.packageName" placeholder="com.example.app" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('startApp')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getDeviceDetail')" name="getDeviceDetail">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getDeviceDetail')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getDeviceStatus')" name="getDeviceStatus">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getDeviceStatus')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane label="Get Root" name="getRoot">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item label="Package">
                      <el-input v-model="formData.packageName" placeholder="com.android.shell" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getRoot')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.hideApp')" name="hideApp">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.package')">
                      <el-input v-model="formData.packageName" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.isHide')">
                      <el-switch v-model="formData.isHide" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('hideApp')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.downloadApp')" name="downloadApp">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.devices')">
                       <el-input v-model="formData.deviceIdStr" placeholder="123,456" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.appName')">
                      <el-input v-model="formData.downloadName" placeholder="App Name" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.downloadUrl')">
                      <el-input v-model="formData.downloadUrl" placeholder="https://..." />
                    </el-form-item>
                    <el-form-item :label="$t('testView.sha256')">
                      <el-input v-model="formData.downloadSha256" placeholder="SHA256 Hash" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.autoInstall')">
                      <el-switch v-model="formData.downloadInstall" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('downLoadInstallApp')">{{ $t('testView.sendDownload') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getDownloadProgress')" name="getDownloadProgress">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.taskId')">
                      <el-input v-model="formData.downloadTaskId" placeholder="Task ID" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getDownloadProgress')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getUserFiles')" name="getUserFiles">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.fileName')">
                      <el-input v-model="formData.fileName" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getUserFiles')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.changePhones')" name="changePhones">
                  <el-form label-width="120px" :model="changePhoneForm">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="changePhoneForm.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.category')">
                      <el-input v-model="changePhoneForm.category" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.bs')">
                      <el-input v-model="changePhoneForm.bs" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.operator')">
                      <el-input v-model="changePhoneForm.operator" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.timezone')">
                      <el-input v-model="changePhoneForm.timezone" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.language')">
                      <el-input v-model="changePhoneForm.language" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.version')">
                      <el-input v-model="changePhoneForm.version" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.country')">
                      <el-input v-model="changePhoneForm.country" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.operatorName')">
                      <el-input v-model="changePhoneForm.operatorName" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.mcc')">
                      <el-input v-model="changePhoneForm.mcc" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.mnc')">
                      <el-input v-model="changePhoneForm.mnc" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.msisdn')">
                      <el-input v-model="changePhoneForm.msisdn" />
                    </el-form-item>
                    <el-form-item :label="$t('changeOs.smsc')">
                      <el-input v-model="changePhoneForm.smsc" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendChangePhones">{{ $t('testView.sendChangePhones') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getTaskStatus')" name="getTaskStatus">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.taskIds')">
                      <el-input v-model="formData.tbChangeOsIdsStr" placeholder="123,456" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getTaskStatus')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.setLocation')" name="setLocation">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.lat')">
                      <el-input-number v-model="formData.lat" :precision="6" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.lng')">
                      <el-input-number v-model="formData.lng" :precision="6" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('setLocation')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <!-- Flattened Generic Commands -->
                <el-tab-pane :label="$t('testView.execShell')" name="execShell">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.shellCmd')">
                      <el-input v-model="formData.shell" placeholder="e.g., ls -l" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('execShell')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.setSocket5')" name="setSocket5">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.s5Url')">
                      <el-input v-model="formData.s5Url" />
                    </el-form-item>
                    <el-form-item :label="$t('testView.outSwId')">
                      <el-input-number v-model="formData.nOutSwID" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('setSocket5')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('testView.getS5Outline')" name="getS5outLine">
                  <el-form label-width="100px">
                    <el-form-item :label="$t('testView.deviceId')">
                      <el-input-number v-model="formData.deviceId" :min="1" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="sendGeneric('getS5outLine')">{{ $t('testView.send') }}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <el-tab-pane :label="$t('rpa.customJson')" name="customJson">
                  <el-input type="textarea" v-model="formData.customJson" :rows="10" />
                  <div class="mt-2">
                    <el-button type="primary" @click="sendGeneric('customJson')">{{ $t('testView.send') }}</el-button>
                  </div>
                </el-tab-pane>

              </el-tabs>
            </div>

            <!-- Right Column: Logs -->
            <div class="right-panel">
              <el-card class="log-card" style="height: 100%; display: flex; flex-direction: column;">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('testView.logs') }}</span>
                    <el-button size="small" @click="clearLogs">{{ $t('testView.clear') }}</el-button>
                  </div>
                </template>
                <div class="log-container" ref="logContainer">
                  <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
                    <div class="log-meta">
                      <span class="log-time">{{ log.time }}</span>
                      <span class="log-type">[{{ log.type }}]</span>
                    </div>
                    <pre class="log-content">{{ log.data }}</pre>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="API Documentation" name="docs">
          <ApiDocs />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, reactive, nextTick, onMounted, watch } from 'vue'

import { useSdkStore } from '@/stores/sdkStore'
import { ElMessage } from 'element-plus'
import ApiDocs from './ApiDocs.vue'

const wsUrl = ref('ws://127.0.0.1:1001/api/unified/ws')
const isConnected = ref(false)
const token = ref('')
const topActiveTab = ref('debug')
const activeTab = ref('login')
const heartbeatEnabled = ref(true)
const heartbeatIntervalMs = ref(30000)

const sdkStore = useSdkStore()

interface LogItem {
  time: string
  type: string
  data: string
}
const logs = ref<LogItem[]>([])
const logContainer = ref<HTMLElement | null>(null)

let ws: WebSocket | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

// Initialize token from sdkStore
onMounted(() => {
  if (sdkStore.apiKey) {
    token.value = sdkStore.apiKey
  }
})


const formData = reactive({
  deviceId: 21323,
  tbDeviceId: 21323,
  shell: 'ls -l',
  packageName: '',
  s5Url: 'socks5://user:pass@1.2.3.4:1080',
  nOutSwID: 11211,
  fileName: '',
  lat: 0,
  lng: 0,
  isHide: true,
  tbChangeOsIdsStr: '123,456',
  downloadTaskId: '',
  deviceIdStr: '21323',
  downloadName: '',
  downloadUrl: 'https://example.com/app.apk',
  downloadSha256: '',
  downloadInstall: true,
  customJson: '{"type": "your_custom_type", "data": {}}'
})

const changePhoneForm = reactive({
  deviceId: 21323,
  category: "491",
  bs: "wifi",
  operator: "00",
  timezone: "America/New_York",
  language: "en-US",
  version: "491",
  country: "us",
  operatorName: "AmeriLink",
  mcc: "310",
  mnc: "630",
  msisdn: "",
  smsc: ""
})

const addLog = (type: 'send' | 'recv' | 'sys', data: any) => {
  const time = new Date().toLocaleTimeString()
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  logs.value.push({
    time,
    type,
    data: content
  })
  
  // Auto scroll
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const sendGeneric = (type: string) => {
  let data: any = {}
  
  try {
    switch (type) {
      case 'downLoadInstallApp':
        const deviceIds = formData.deviceIdStr.split(',').map(id => {
          const parsed = parseInt(id.trim())
          return isNaN(parsed) ? null : parsed
        }).filter(id => id !== null)
        data = {
          devices: deviceIds,
          name: formData.downloadName,
          url: formData.downloadUrl,
          sha256: formData.downloadSha256,
          install: formData.downloadInstall,
          receive: true
        }
        break
      case 'execShell':
        data = { deviceId: formData.deviceId, shell: formData.shell }
        break
      case 'startApp':
        data = { deviceId: formData.deviceId, packageName: formData.packageName }
        break
      case 'getDeviceDetail':
        data = { deviceId: formData.deviceId }
        break
      case 'getDeviceStatus':
        data = { deviceId: formData.deviceId }
        break
      case 'getRoot':
        data = { deviceId: formData.deviceId, pkg: formData.packageName || 'com.android.shell' }
        break
      case 'getAppList':
        data = { deviceId: formData.tbDeviceId }
        break
      case 'getTaskStatus':
        const ids = formData.tbChangeOsIdsStr.split(',').map(id => {
          const parsed = parseInt(id.trim())
          return isNaN(parsed) ? null : parsed
        }).filter(id => id !== null)
        data = { tbChangeOsIds: ids }
        break
      case 'setSocket5':
        data = { deviceId: formData.deviceId, s5Url: formData.s5Url, nOutSwID: formData.nOutSwID }
        break
      case 'getS5outLine':
        data = { deviceId: formData.deviceId }
        break
      case 'customJson':
        try {
          const parsed = JSON.parse(formData.customJson)
          let customType = type
          let customData: any = {}
          let extra: any = {}

          if (parsed.type) {
             customType = parsed.type
          }

          if (parsed.seq !== undefined) {
             extra['seq'] = parsed.seq
          }

          if (parsed.data !== undefined) {
             customData = parsed.data
          } else {
             // If no explicit 'data' field, use the remaining properties
             const remainder = { ...parsed }
             delete remainder.type
             delete remainder.seq
             if (Object.keys(remainder).length > 0) {
                customData = remainder
             }
          }
          
          send(customType, customData, extra)
          return
        } catch(e) {
           ElMessage.error('Invalid JSON')
           return
        }
        break
      case 'getUserFiles':
        data = { fileName: formData.fileName }
        break
      case 'getDownloadProgress':
        data = { deviceId: formData.deviceId, id: formData.downloadTaskId }
        break
      case 'setLocation':
        data = [{ deviceId: formData.deviceId, lat: formData.lat, lng: formData.lng }]
        break
      case 'hideApp':
        data = {
          deviceId: formData.deviceId,
          packageName: formData.packageName,
          isHide: formData.isHide
        }
        break
      default:
        data = {}
    }
    
    send(type, data)
  } catch (e) {
    console.error(e)
    ElMessage.error('Error preparing request data')
  }
}

const connect = () => {
  try {
    ws = new WebSocket(wsUrl.value)
    
    ws.onopen = () => {
      isConnected.value = true
      ElMessage.success('Connected')
      addLog('sys', `Connected to ${wsUrl.value}`)
      startHeartbeat()
    }
    
    ws.onclose = () => {
      isConnected.value = false
      ElMessage.warning('Disconnected')
      addLog('sys', 'Disconnected')
      stopHeartbeat()
    }
    
    ws.onerror = (err) => {
      ElMessage.error('Connection error')
      console.error(err)
      addLog('sys', 'Connection Error')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addLog('recv', data)
      } catch (e) {
        addLog('recv', event.data)
      }
    }
  } catch (e) {
    ElMessage.error('Failed to create WebSocket')
  }
}

const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  stopHeartbeat()
}

const startHeartbeat = () => {
  stopHeartbeat()
  if (!heartbeatEnabled.value) {
    return
  }
  heartbeatTimer = setInterval(() => {
    sendHeartbeat()
  }, heartbeatIntervalMs.value)
}

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

const sendHeartbeat = () => {
  send('Ping')
}

watch([heartbeatEnabled, heartbeatIntervalMs, isConnected], () => {
  if (isConnected.value) {
    startHeartbeat()
  } else {
    stopHeartbeat()
  }
})

const send = (type: string, data: any = null, extra: any = {}) => {
  if (!ws || !isConnected.value) {
    ElMessage.warning('Not connected')
    return
  }

  const seq = Math.floor(Math.random() * 10000)
  const payload = {
    type,
    seq,
    data,
    ...extra
  }
  
  const msg = JSON.stringify(payload)
  ws.send(msg)
  
  addLog('send', payload)
}

const sendLogin = () => {
  if (!token.value) {
    ElMessage.warning('Enter token')
    return
  }
  send('Login', null, { token: token.value })
}

const sendGetDeviceList = () => {
  send('GetDeviceList')
}

const sendChangePhones = () => {
  try {
    const data = [{
      ...changePhoneForm
    }]
    send('Changephones', data, { req: true })
  } catch (e) {
    ElMessage.error('Invalid Data')
  }
}


onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.unified-test-view {
  padding: 20px;
  height: 100%; /* Changed from 100vh to 100% to fit in MainLayout */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.connection-card {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.status-indicator.connected {
  background-color: #67c23a;
}

.main-content {
  flex-grow: 1;
  overflow: hidden;
}

.top-level-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-level-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.top-level-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.content-flex-container {
  display: flex;
  height: 100%;
  gap: 20px;
  padding: 15px;
}

.left-panel {
  flex: 0 0 630px; /* Fixed width 630px */
  height: 100%;
  overflow: hidden;
}

.right-panel {
  flex: 1; /* Adaptive width */
  height: 100%;
  min-width: 0; /* Prevent overflow */
}

.function-tabs {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.function-tabs :deep(.el-tabs__content) {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.log-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.log-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: monospace;
}

.log-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.log-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 12px;
  opacity: 0.7;
}

.log-type {
  font-weight: bold;
}

.log-item.send .log-type { color: #409eff; }
.log-item.recv .log-type { color: #67c23a; }
.log-item.sys .log-type { color: #e6a23c; }

.log-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.mt-2 {
  margin-top: 10px;
}
</style>
