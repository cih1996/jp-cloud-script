<template>
  <div class="rpa-test p-4 h-full flex flex-col">
    <el-card class="flex-1 flex flex-col" :body-style="{ display: 'flex', flexDirection: 'column', height: '100%' }">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">RPA SDK Test (Standalone)</span>
          <el-tag type="info">jpy-sdk/rpa</el-tag>
        </div>
      </template>

      <el-form :inline="true" class="mb-4">
        <el-form-item label="WebSocket URL">
          <el-input v-model="wsUrl" placeholder="ws://127.0.0.1:9009/ws" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="connect" :disabled="isConnected" :loading="isConnecting">Connect</el-button>
          <el-button type="danger" @click="disconnect" :disabled="!isConnected">Disconnect</el-button>
        </el-form-item>
      </el-form>

      <div v-if="isConnected" class="controls mb-4">
        <el-divider content-position="left">Android Commands</el-divider>
        <el-space wrap>
          <el-button @click="enableAdbWifi">Enable ADB Wifi</el-button>
          <el-button @click="screenshot">Screenshot</el-button>
        </el-space>
      </div>

      <div class="logs bg-black text-white p-4 rounded flex-1 overflow-y-auto font-mono text-sm" ref="logContainer">
        <div v-for="(log, i) in logs" :key="i" class="mb-1 border-b border-gray-800 pb-1">
          <span class="text-gray-400 mr-2">[{{ log.time }}]</span>
          <span :class="log.type === 'error' ? 'text-red-400' : 'text-green-400'">{{ log.msg }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick, watch } from 'vue'
import { RPAClient, AndroidClient } from '@/libs/jpy-sdk'

const wsUrl = ref('ws://127.0.0.1:9009/ws')
const isConnected = ref(false)
const isConnecting = ref(false)
const logs = ref<{time: string, msg: string, type?: string}[]>([])
const logContainer = ref<HTMLElement>()

let rpaClient: RPAClient | null = null
let androidClient: AndroidClient | null = null

const log = (msg: string, type: 'info' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, msg, type })
}

watch(logs, () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}, { deep: true })

const connect = async () => {
  isConnecting.value = true
  log(`Connecting to ${wsUrl.value}...`)
  
  try {
    rpaClient = new RPAClient(wsUrl.value)
    
    const originalOnConnect = rpaClient.onConnect
    rpaClient.onConnect = () => {
        isConnected.value = true
        isConnecting.value = false
        log('Connected!')
        if (originalOnConnect) originalOnConnect.call(rpaClient!)
    }
    
    const originalOnClose = rpaClient.onClose
    rpaClient.onClose = () => {
        isConnected.value = false
        isConnecting.value = false
        log('Disconnected', 'error')
        if (originalOnClose) originalOnClose.call(rpaClient!)
    }
    
    // Inject log
    rpaClient.log = (msg: any) => {
       const str = typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
       console.log('[SDK]', str)
       // Optional: Log all SDK messages to UI? Might be too noisy.
       // log(`[SDK] ${str}`) 
    }

    rpaClient.start()
    
    androidClient = new AndroidClient(rpaClient)
    
  } catch (e) {
    log(`Error: ${e}`, 'error')
    isConnecting.value = false
  }
}

const disconnect = () => {
  if (rpaClient) {
    rpaClient.Close()
    rpaClient = null
    androidClient = null
    isConnected.value = false
  }
}

const enableAdbWifi = async () => {
  if (!androidClient) return
  log('Executing: enableAdbWifi...')
  try {
     // Root grant is usually required
     log('Granting root permission...')
     await androidClient.device.rootGrant("com.android.shell")
     
     log('Enabling ADB Wifi...')
     await androidClient.device.enableAdbWifi()
     log('ADB Wifi Enabled successfully')
  } catch (e) {
     log(`Failed: ${e}`, 'error')
  }
}

const screenshot = async () => {
    if (!androidClient) return
    log('Executing: screenshot...')
    try {
        const res = await androidClient.screen.screenshot()
        log(`Screenshot success. Size: ${res?.data?.length || 0} bytes`)
    } catch (e) {
        log(`Failed: ${e}`, 'error')
    }
}

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.rpa-test {
    height: 100vh;
    box-sizing: border-box;
}
</style>