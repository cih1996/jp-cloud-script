<!-- 设备检查器视图组件 -->
<template>
  <div class="inspector-view">
    <div class="toolbar">
      <div class="left">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon> {{ $t('common.back') }}
        </el-button>
        <span class="device-title" v-if="deviceId">Device #{{ deviceId }}</span>
        <el-tag v-if="isOnline" type="success" class="ml-2">{{ $t('device.online') }}</el-tag>
        <el-tag v-else type="danger" class="ml-2">{{ $t('device.offline') }}</el-tag>
      </div>
      <div class="right">
        <el-button type="warning" plain @click="toggleAdb">
           {{ adbEnabled ? $t('inspector.disableAdb') : $t('inspector.enableAdb') }}
        </el-button>
        <el-button type="primary" @click="refreshScreen">
          <el-icon><Refresh /></el-icon> {{ $t('inspector.refreshScreen') }}
        </el-button>
      </div>
    </div>

    <div class="workspace">
      <!-- Left: Device Screen & Interaction -->
      <div class="panel screen-panel">
        <div class="panel-header">
          <span>{{ $t('inspector.screen') }}</span>
          <div class="panel-tools">
             <el-radio-group v-model="interactionMode" size="small">
               <el-radio-button label="inspect">Inspect</el-radio-button>
               <el-radio-button label="touch">Touch</el-radio-button>
             </el-radio-group>
          </div>
        </div>
        <div class="screen-content" ref="screenContainer">
          <!-- Placeholder for Screen Stream -->
          <div class="device-screen" @click="handleScreenClick" @mousemove="handleScreenHover">
             <div v-if="!screenUrl" class="placeholder-screen">
                <el-icon :size="48"><Cellphone /></el-icon>
                <p>{{ $t('inspector.noScreen') }}</p>
                <el-button type="primary" link @click="startStream">{{ $t('inspector.startStream') }}</el-button>
             </div>
             <img v-else :src="screenUrl" class="screen-img" alt="Device Screen" />
             
             <!-- Crosshair/Highlight Overlay -->
             <div v-if="hoverPos && interactionMode === 'inspect'" 
                  class="crosshair" 
                  :style="{ left: hoverPos.x + 'px', top: hoverPos.y + 'px' }">
             </div>
          </div>
        </div>
        <div class="status-bar">
          <span>X: {{ currentPos.x }} Y: {{ currentPos.y }}</span>
          <span class="ml-4">Color: <span :style="{ color: currentColor }">{{ currentColor }}</span></span>
        </div>
      </div>

      <!-- Right: Code Generator & Tools -->
      <div class="panel tools-panel">
        <div class="panel-header">
          <span>{{ $t('inspector.tools') }}</span>
        </div>
        <div class="tools-content">
          <el-collapse v-model="activeTools">
            <el-collapse-item :title="$t('inspector.codeGen')" name="1">
              <el-form label-position="top" size="small">
                <el-form-item label="Action Type">
                  <el-select v-model="genType" style="width: 100%">
                    <el-option label="Click Point" value="click" />
                    <el-option label="Find Color" value="findColor" />
                    <el-option label="Find Image" value="findImage" />
                  </el-select>
                </el-form-item>
                
                <div v-if="genType === 'findColor'" class="color-preview">
                  <div class="color-box" :style="{ backgroundColor: currentColor }"></div>
                  <span>{{ currentColor }}</span>
                </div>

                <el-form-item label="Generated Code">
                  <el-input 
                    v-model="generatedCode" 
                    type="textarea" 
                    :rows="4" 
                    readonly 
                    resize="none"
                  />
                  <el-button type="primary" link size="small" class="mt-1" @click="copyCode">
                    {{ $t('common.copy') }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            
            <el-collapse-item :title="$t('inspector.adbInfo')" name="2">
              <div class="info-row">
                <label>ADB Host:</label>
                <span>127.0.0.1</span>
              </div>
              <div class="info-row">
                <label>ADB Port:</label>
                <span>{{ adbPort || 'Not Mapped' }}</span>
              </div>
              <el-alert
                v-if="adbPort"
                :title="$t('inspector.adbTip', { port: adbPort })"
                type="info"
                :closable="false"
                class="mt-2"
              />
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh, Cellphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const deviceId = computed(() => route.params.id)
const isOnline = ref(true) // Mock
const adbEnabled = ref(false)
const adbPort = ref<number | null>(null)
const screenUrl = ref('')
const interactionMode = ref('inspect')
const activeTools = ref(['1', '2'])

// Interaction State
const currentPos = ref({ x: 0, y: 0 })
const hoverPos = ref<{x: number, y: number} | null>(null)
const currentColor = ref('#FFFFFF')

// Code Gen
const genType = ref('click')
const generatedCode = computed(() => {
  const { x, y } = currentPos.value
  const color = currentColor.value
  
  switch (genType.value) {
    case 'click':
      return `click(${x}, ${y});`
    case 'findColor':
      return `if (findColor("${color}", ${x}, ${y})) {\n  click(${x}, ${y});\n}`
    case 'findImage':
      return `// TODO: Implement image finding\nfindImage("target.png");`
    default:
      return ''
  }
})

const handleScreenHover = (e: MouseEvent) => {
  if (interactionMode.value !== 'inspect') return
  // Calculate relative position (mock logic)
  // In real app, map DOM coordinates to device coordinates
  hoverPos.value = { x: e.offsetX, y: e.offsetY }
}

const handleScreenClick = (e: MouseEvent) => {
  if (interactionMode.value === 'inspect') {
    currentPos.value = { x: e.offsetX, y: e.offsetY }
    // Mock color pick
    currentColor.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
  } else {
    // Send touch event
    ElMessage.success(`Touch at ${e.offsetX}, ${e.offsetY}`)
  }
}

const toggleAdb = () => {
  adbEnabled.value = !adbEnabled.value
  if (adbEnabled.value) {
    adbPort.value = 5555 + Number(deviceId.value || 0) % 1000 // Mock port mapping
    ElMessage.success(`ADB Mapped to 127.0.0.1:${adbPort.value}`)
  } else {
    adbPort.value = null
  }
}

const startStream = () => {
  // Mock stream start
  screenUrl.value = 'https://via.placeholder.com/360x640.png?text=Device+Screen'
}

const refreshScreen = () => {
  startStream()
}

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value)
  ElMessage.success('Code copied')
}

onMounted(() => {
  // Fetch device details
})
</script>

<style scoped lang="scss">
.inspector-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
  padding: 16px;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.device-title {
  font-size: 16px;
  font-weight: 600;
  margin-left: 12px;
}

.workspace {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.panel {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.screen-panel {
  flex: 2;
  min-width: 400px;
}

.tools-panel {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.screen-content {
  flex: 1;
  background: #1f2937;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: auto;
  padding: 20px;
}

.device-screen {
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  cursor: crosshair;
}

.placeholder-screen {
  width: 360px;
  height: 640px;
  background: #374151;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  
  .el-icon {
    margin-bottom: 16px;
  }
}

.screen-img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.crosshair {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ef4444;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.region-box {
  position: absolute;
  border: 2px dashed #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
  pointer-events: none;
}

.status-bar {
  padding: 8px 16px;
  background: #111827;
  color: #d1d5db;
  font-family: monospace;
  font-size: 12px;
}

.tools-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  
  .color-box {
    width: 24px;
    height: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  
  label {
    color: #6b7280;
  }
  
  span {
    font-weight: 500;
    color: #111827;
  }
}
</style>
