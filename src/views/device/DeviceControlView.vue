<!-- 设备操控页面 -->
<template>
  <div class="device-control">
    <div class="control-layout">
      <!-- 左侧：截图预览区 -->
      <div class="preview-panel">
        <el-card shadow="never" class="preview-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('control.screenPreview') }}</span>
              <div class="header-actions">
                <el-button :icon="Refresh" circle size="small" @click="takeScreenshot" :loading="screenshotLoading" />
                <el-switch v-model="autoRefresh" :active-text="$t('control.autoRefresh')" size="small" class="ml-2" />
              </div>
            </div>
          </template>
          <div class="screen-container" ref="screenContainer">
            <div v-if="!screenshotSrc" class="empty-screen">
              <el-icon :size="48"><Monitor /></el-icon>
              <p>{{ $t('control.noScreenshot') }}</p>
              <el-button type="primary" @click="takeScreenshot" :disabled="!selectedDeviceId">{{ $t('control.capture') }}</el-button>
            </div>
            <img
              v-else
              :src="screenshotSrc"
              class="screen-image"
              ref="screenImage"
              @click="handleScreenClick"
              @contextmenu.prevent
              draggable="false"
            />
            <!-- 点击反馈 -->
            <div
              v-if="clickFeedback"
              class="click-feedback"
              :style="{ left: clickFeedback.x + 'px', top: clickFeedback.y + 'px' }"
            />
          </div>
          <div class="screen-footer" v-if="lastCoord">
            <span class="coord-info">{{ $t('control.lastClick') }}: ({{ lastCoord.x }}, {{ lastCoord.y }})</span>
          </div>
        </el-card>
      </div>

      <!-- 右侧：操控面板 -->
      <div class="action-panel">
        <!-- 设备选择 -->
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>{{ $t('control.deviceSelect') }}</span>
          </template>
          <el-select
            v-model="selectedDeviceId"
            :placeholder="$t('control.selectDevice')"
            filterable
            style="width: 100%"
            @change="handleDeviceChange"
          >
            <el-option
              v-for="d in deviceList"
              :key="d.deviceId"
              :label="`${d.deviceId} - ${d.deviceInfo?.brand || 'Unknown'}`"
              :value="d.deviceId"
            >
              <div class="device-option">
                <span>{{ d.deviceId }}</span>
                <span class="device-option-brand">{{ d.deviceInfo?.brand }}</span>
                <span :class="['device-option-status', d.deviceInfo?.online ? 'online' : 'offline']">
                  {{ d.deviceInfo?.online ? $t('device.online') : $t('device.offline') }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-card>

        <!-- 快捷按键 -->
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>{{ $t('control.quickKeys') }}</span>
          </template>
          <div class="key-grid">
            <el-button @click="sendKeyPress(3)" :disabled="!selectedDeviceId">
              <el-icon><HomeFilled /></el-icon> HOME
            </el-button>
            <el-button @click="sendKeyPress(4)" :disabled="!selectedDeviceId">
              <el-icon><Back /></el-icon> BACK
            </el-button>
            <el-button @click="sendKeyPress(66)" :disabled="!selectedDeviceId">
              ENTER
            </el-button>
            <el-button @click="sendKeyPress(26)" :disabled="!selectedDeviceId">
              <el-icon><SwitchButton /></el-icon> {{ $t('control.power') }}
            </el-button>
            <el-button @click="sendKeyPress(24)" :disabled="!selectedDeviceId">
              🔊 VOL+
            </el-button>
            <el-button @click="sendKeyPress(25)" :disabled="!selectedDeviceId">
              🔉 VOL-
            </el-button>
          </div>
        </el-card>

        <!-- 滚动控制 -->
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>{{ $t('control.scrollControl') }}</span>
          </template>
          <div class="scroll-row">
            <el-button type="primary" plain @click="sendScroll(-1)" :disabled="!selectedDeviceId" class="scroll-btn">
              <el-icon><ArrowUp /></el-icon> {{ $t('control.scrollUp') }}
            </el-button>
            <el-button type="primary" plain @click="sendScroll(1)" :disabled="!selectedDeviceId" class="scroll-btn">
              <el-icon><ArrowDown /></el-icon> {{ $t('control.scrollDown') }}
            </el-button>
          </div>
        </el-card>

        <!-- 文字输入 -->
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>{{ $t('control.textInput') }}</span>
          </template>
          <div class="input-row">
            <el-input v-model="inputText" :placeholder="$t('control.inputPlaceholder')" @keyup.enter="sendInputText" clearable />
            <el-button type="primary" @click="sendInputText" :disabled="!selectedDeviceId || !inputText" class="ml-2">
              {{ $t('control.send') }}
            </el-button>
          </div>
        </el-card>

        <!-- 手动坐标点击 -->
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>{{ $t('control.manualTouch') }}</span>
          </template>
          <div class="coord-row">
            <el-input-number v-model="manualX" :min="0" :max="720" placeholder="X" controls-position="right" style="width: 120px" />
            <el-input-number v-model="manualY" :min="0" :max="1600" placeholder="Y" controls-position="right" style="width: 120px" class="ml-2" />
            <el-button type="primary" @click="sendManualTouch" :disabled="!selectedDeviceId" class="ml-2">
              {{ $t('control.tap') }}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSdkStore } from '@/stores/sdkStore'
import { localService } from '@/api/localService'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  Monitor, Refresh, HomeFilled, Back, SwitchButton,
  ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

const { t } = useI18n()
const sdkStore = useSdkStore()

const DEVICE_WIDTH = 720
const DEVICE_HEIGHT = 1600

const selectedDeviceId = ref<number | null>(null)
const deviceList = ref<any[]>([])
const screenshotSrc = ref('')
const screenshotLoading = ref(false)
const autoRefresh = ref(true)
const inputText = ref('')
const manualX = ref(360)
const manualY = ref(800)
const lastCoord = ref<{ x: number; y: number } | null>(null)
const clickFeedback = ref<{ x: number; y: number } | null>(null)
const screenImage = ref<HTMLImageElement | null>(null)

let seqCounter = 0
const nextSeq = () => ++seqCounter

// 获取设备列表
const fetchDevices = async () => {
  if (!sdkStore.sdk) return
  try {
    const res = await sdkStore.sdk.userDeviceCtl.getUserDeviceList({ pageNum: 1, pageSize: 100 })
    deviceList.value = res?.records || []
  } catch (e) {
    ElMessage.error(t('control.loadDevicesFailed'))
  }
}

// 发送统一 API 请求
const sendUnified = async (type: string, data: any) => {
  try {
    const res = await localService.callUnified({ type, seq: nextSeq(), data })
    return res
  } catch (e: any) {
    ElMessage.error(`${type} failed: ${e.message}`)
    throw e
  }
}

// 操作后自动刷新截图
const autoScreenshot = () => {
  if (autoRefresh.value && selectedDeviceId.value) {
    setTimeout(() => takeScreenshot(), 500)
  }
}

// 截图
const takeScreenshot = async () => {
  if (!selectedDeviceId.value) return
  screenshotLoading.value = true
  try {
    const res = await sendUnified('screenshot', {
      deviceId: selectedDeviceId.value,
      width: 540,
      quality: 70
    })
    if (res?.data?.image) {
      screenshotSrc.value = 'data:image/webp;base64,' + res.data.image
    }
  } finally {
    screenshotLoading.value = false
  }
}

// 点击屏幕图片 → touch
const handleScreenClick = async (e: MouseEvent) => {
  if (!selectedDeviceId.value || !screenImage.value) return
  const img = screenImage.value
  const rect = img.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top
  const deviceX = Math.round(clickX / rect.width * DEVICE_WIDTH)
  const deviceY = Math.round(clickY / rect.height * DEVICE_HEIGHT)

  // 点击反馈动画
  clickFeedback.value = { x: clickX, y: clickY }
  setTimeout(() => { clickFeedback.value = null }, 400)
  lastCoord.value = { x: deviceX, y: deviceY }

  await sendTouch(deviceX, deviceY)
}

// 发送 touch（按下 + 抬起）
const sendTouch = async (x: number, y: number) => {
  if (!selectedDeviceId.value) return
  const base = { deviceId: selectedDeviceId.value, x, y, id: 1, offset: 10, pressure: 1 }
  await sendUnified('touch', { ...base, touchType: 0 })
  await sendUnified('touch', { ...base, touchType: 1 })
  autoScreenshot()
}

// 按键
const sendKeyPress = async (keyCode: number) => {
  if (!selectedDeviceId.value) return
  await sendUnified('keyPress', { deviceId: selectedDeviceId.value, keyCode, action: 3 })
  autoScreenshot()
}

// 滚动
const sendScroll = async (upOrDown: number) => {
  if (!selectedDeviceId.value) return
  await sendUnified('scroll', {
    deviceId: selectedDeviceId.value,
    upOrDown,
    x: 360,
    y: 800
  })
  autoScreenshot()
}

// 输入文字
const sendInputText = async () => {
  if (!selectedDeviceId.value || !inputText.value) return
  await sendUnified('inputText', { deviceId: selectedDeviceId.value, text: inputText.value })
  inputText.value = ''
  autoScreenshot()
}

// 手动坐标点击
const sendManualTouch = async () => {
  if (!selectedDeviceId.value) return
  lastCoord.value = { x: manualX.value, y: manualY.value }
  await sendTouch(manualX.value, manualY.value)
}

// 设备切换
const handleDeviceChange = () => {
  screenshotSrc.value = ''
  lastCoord.value = null
  if (selectedDeviceId.value) {
    takeScreenshot()
  }
}

onMounted(() => {
  fetchDevices()
})
</script>

<style scoped lang="scss">
.device-control {
  padding: 16px;
  height: 100%;
  background-color: #f3f4f6;
  overflow-y: auto;
}

.control-layout {
  display: flex;
  gap: 16px;
  height: 100%;
}

.preview-panel {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
}

.preview-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: none;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.screen-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

.empty-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.screen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: crosshair;
  user-select: none;
}

.click-feedback {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.5);
  border: 2px solid #2563eb;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: clickPulse 0.4s ease-out forwards;
}

@keyframes clickPulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.screen-footer {
  padding: 8px 0 0;
  .coord-info {
    font-size: 12px;
    color: #6b7280;
    font-family: monospace;
  }
}

.action-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.action-card {
  border-radius: 8px;
  border: none;

  :deep(.el-card__header) {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid #f3f4f6;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.key-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.scroll-row {
  display: flex;
  gap: 12px;
  .scroll-btn { flex: 1; }
}

.input-row {
  display: flex;
  align-items: center;
}

.coord-row {
  display: flex;
  align-items: center;
}

.ml-2 { margin-left: 8px; }

.device-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.device-option-brand {
  color: #9ca3af;
  font-size: 12px;
}

.device-option-status {
  font-size: 12px;
  &.online { color: #10b981; }
  &.offline { color: #9ca3af; }
}
</style>
