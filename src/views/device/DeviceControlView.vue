<!-- 脚本调试页面 - 专用于脚本APK调试 -->
<script lang="ts">
export default { name: 'DeviceControlView' }
</script>
<template>
  <div class="script-debug-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="selectedDeviceId"
          placeholder="选择设备"
          filterable
          style="width: 280px"
          @change="handleDeviceChange"
        >
          <el-option
            v-for="d in wsDeviceList"
            :key="d.deviceId"
            :label="`${d.serialno} - ${d.brand || ''} ${d.model || ''}`"
            :value="d.deviceId"
          >
            <div class="device-option">
              <span class="device-serial">{{ d.serialno }}</span>
              <span class="device-info">{{ d.brand }} {{ d.model }}</span>
            </div>
          </el-option>
        </el-select>
        <el-tag v-if="selectedDevice" type="success" class="ml-2">
          {{ selectedDevice.screenWidth }}x{{ selectedDevice.screenHeight }}
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button @click="fetchWsDevices" :icon="Refresh" circle title="刷新设备列表" />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：截图/节点 Tab 切换 -->
      <div class="preview-section">
        <el-tabs v-model="leftTab" class="preview-tabs">
          <!-- 截图 Tab -->
          <el-tab-pane label="截图" name="screenshot">
            <template #label>
              <span><el-icon><Camera /></el-icon> 截图</span>
            </template>
            <div class="tab-header">
              <el-button size="small" @click="takeScreenshot" :loading="screenshotLoading" :disabled="!selectedDeviceId">
                <el-icon><Refresh /></el-icon> 刷新
              </el-button>
              <el-switch v-model="autoRefreshScreen" active-text="自动" size="small" />
            </div>
            <div class="screen-container">
              <div v-if="!screenshotSrc" class="empty-screen">
                <el-icon :size="48"><Monitor /></el-icon>
                <p>{{ selectedDeviceId ? '点击刷新按钮获取屏幕' : '请先选择设备' }}</p>
              </div>
              <img
                v-else
                :src="screenshotSrc"
                class="screen-image"
                ref="screenImage"
                @click="handleScreenClick"
                @mousedown="startImageDrag"
                :style="imageStyle"
                draggable="false"
              />
              <!-- 右上角信息面板 -->
              <div v-if="clickInfo" class="click-info-panel">
                <div class="info-row">
                  <span class="info-label">坐标:</span>
                  <span class="info-value">{{ clickInfo.x }}, {{ clickInfo.y }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">颜色:</span>
                  <span class="info-value">
                    <span class="color-preview" :style="{ background: clickInfo.color }"></span>
                    {{ clickInfo.color }}
                  </span>
                </div>
              </div>
              <!-- 缩放滑块 -->
              <div v-if="screenshotSrc" class="zoom-slider">
                <el-icon><ZoomOut /></el-icon>
                <el-slider v-model="imageScale" :min="10" :max="200" :step="10" :show-tooltip="false" style="width: 100px" />
                <el-icon><ZoomIn /></el-icon>
                <span class="zoom-value">{{ imageScale }}%</span>
              </div>
            </div>
          </el-tab-pane>

          <!-- 节点 Tab -->
          <el-tab-pane label="节点" name="nodes">
            <template #label>
              <span><el-icon><Document /></el-icon> 节点</span>
            </template>
            <div class="tab-header">
              <el-input
                v-model="nodeSearchKey"
                placeholder="搜索..."
                size="small"
                clearable
                style="width: 100px"
                :prefix-icon="Search"
              />
              <el-button size="small" @click="getNodes" :loading="nodesLoading" :disabled="!selectedDeviceId">
                获取
              </el-button>
              <el-button size="small" @click="expandAllNodes" :disabled="!nodesData" title="全部展开">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button size="small" @click="collapseAllNodes" :disabled="!nodesData" title="全部收起">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="nodes-container">
              <div v-if="!nodesData" class="empty-nodes">
                <el-icon :size="48"><Document /></el-icon>
                <p>点击获取按钮获取节点树</p>
              </div>
              <div v-else class="node-tree-wrapper" ref="nodeTreeRef">
                <div
                  v-for="item in flattenedNodes"
                  :key="item.id"
                  class="tree-node"
                  :class="{
                    'is-selected': selectedNodeId === item.id,
                    'is-match': item.isMatch
                  }"
                  :style="{ paddingLeft: (item.depth * 16 + 8) + 'px' }"
                  @click="selectNodeById(item.id, item.node)"
                >
                  <span
                    class="tree-expand"
                    :class="{ 'is-leaf': !item.hasChildren }"
                    @click.stop="toggleNode(item.id)"
                  >
                    <el-icon v-if="item.hasChildren" :class="{ 'is-expanded': expandedKeys.has(item.id) }">
                      <CaretRight />
                    </el-icon>
                    <span v-else class="leaf-dot"></span>
                  </span>
                  <span class="tree-icon" :class="getNodeIconClass(item.node)">
                    <el-icon><component :is="getNodeIcon(item.node)" /></el-icon>
                  </span>
                  <span class="tree-label">
                    <span class="node-class">{{ item.node.className?.split('.').pop() || 'View' }}</span>
                    <span v-if="item.node.text" class="node-text">"{{ truncate(item.node.text, 15) }}"</span>
                    <span v-if="item.node.resourceId" class="node-id">#{{ item.node.resourceId.split('/').pop() }}</span>
                  </span>
                  <span v-if="item.node.clickable" class="tree-badge clickable">可点击</span>
                </div>
              </div>
            </div>
            <!-- 节点详情面板 -->
            <div v-if="selectedNode" class="node-detail">
              <div class="detail-header">
                <span>节点属性</span>
                <div class="detail-actions">
                  <el-button size="small" link @click="insertNodeCode">插入代码</el-button>
                  <el-button size="small" link @click="copyNodeInfo">复制JSON</el-button>
                </div>
              </div>
              <div class="detail-content">
                <div v-for="(value, key) in selectedNodeProps" :key="key" class="detail-row">
                  <span class="detail-key">{{ key }}</span>
                  <span class="detail-value" :class="{ highlight: isSearchMatch(String(value)) }">{{ value }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- OCR Tab -->
          <el-tab-pane label="OCR" name="ocr">
            <template #label>
              <span><el-icon><Picture /></el-icon> OCR</span>
            </template>
            <div class="tab-header">
              <el-input-number v-model="ocrQuality" :min="1" :max="100" :step="5" size="small" style="width: 90px" />
              <span class="ocr-quality-label">近似度</span>
              <el-button size="small" type="primary" @click="runOcr" :loading="ocrLoading" :disabled="!selectedDeviceId">
                识别
              </el-button>
              <el-button size="small" @click="expandAllOcr" :disabled="!ocrResults.length" title="全部展开">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button size="small" @click="collapseAllOcr" :disabled="!ocrResults.length" title="全部收起">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="ocr-container">
              <div v-if="!ocrResults.length" class="empty-nodes">
                <el-icon :size="48"><Picture /></el-icon>
                <p>点击识别按钮进行 OCR 识别</p>
              </div>
              <div v-else class="ocr-list">
                <div
                  v-for="(item, index) in ocrResults"
                  :key="index"
                  class="ocr-item"
                  :class="{ 'is-selected': selectedOcrIndex === index, 'is-expanded': ocrExpandedKeys.has(index) }"
                  @click="selectOcrItem(index, item)"
                >
                  <div class="ocr-item-header">
                    <span class="ocr-expand" @click.stop="toggleOcrItem(index)">
                      <el-icon :class="{ 'is-expanded': ocrExpandedKeys.has(index) }"><CaretRight /></el-icon>
                    </span>
                    <span class="ocr-label">{{ item.label }}</span>
                    <el-tag size="small" :type="item.qua >= 90 ? 'success' : item.qua >= 70 ? 'warning' : 'info'">
                      {{ item.qua.toFixed(1) }}%
                    </el-tag>
                  </div>
                  <div v-if="ocrExpandedKeys.has(index)" class="ocr-item-detail">
                    <div class="detail-row">
                      <span class="detail-key">中心坐标</span>
                      <span class="detail-value">{{ item.x }}, {{ item.y }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-key">区域</span>
                      <span class="detail-value">({{ item.x1 }}, {{ item.y1 }}) - ({{ item.x2 }}, {{ item.y2 }})</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-key">尺寸</span>
                      <span class="detail-value">{{ item.x2 - item.x1 }} x {{ item.y2 - item.y1 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- OCR 详情面板 -->
            <div v-if="selectedOcrItem" class="node-detail">
              <div class="detail-header">
                <span>OCR 详情</span>
                <div class="detail-actions">
                  <el-button size="small" link @click="insertOcrClickCode">插入点击</el-button>
                  <el-button size="small" link @click="copyOcrInfo">复制JSON</el-button>
                </div>
              </div>
              <div class="detail-content">
                <div class="detail-row">
                  <span class="detail-key">文本</span>
                  <span class="detail-value">{{ selectedOcrItem.label }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-key">置信度</span>
                  <span class="detail-value">{{ selectedOcrItem.qua.toFixed(2) }}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-key">中心坐标</span>
                  <span class="detail-value">{{ selectedOcrItem.x }}, {{ selectedOcrItem.y }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-key">左上角</span>
                  <span class="detail-value">{{ selectedOcrItem.x1 }}, {{ selectedOcrItem.y1 }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-key">右下角</span>
                  <span class="detail-value">{{ selectedOcrItem.x2 }}, {{ selectedOcrItem.y2 }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧：编辑器 + 结果 -->
      <div class="right-section">
        <!-- 脚本编辑器 -->
        <div class="editor-section">
          <div class="section-header editor-header">
            <div class="header-title">
              <span>脚本编辑器</span>
              <span v-if="currentScriptName" class="current-script-name">
                - {{ currentScriptName }}
                <el-button link size="small" @click="clearCurrentScript" title="新建脚本">
                  <el-icon><Close /></el-icon>
                </el-button>
              </span>
              <span v-else class="current-script-name new-script">- 新脚本</span>
            </div>
            <div class="header-actions">
              <el-button size="small" @click="showScriptRepo = true">
                <el-icon><FolderOpened /></el-icon> 仓库
              </el-button>
              <el-button size="small" @click="saveCurrentScript" :disabled="!scriptCode.trim()">
                <el-icon><DocumentAdd /></el-icon> 保存
              </el-button>
              <el-dropdown @command="loadTemplate" class="ml-2">
                <el-button size="small">
                  模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="click">点击坐标</el-dropdown-item>
                    <el-dropdown-item command="longClick">长按</el-dropdown-item>
                    <el-dropdown-item command="swipe">滑动操作</el-dropdown-item>
                    <el-dropdown-item command="text">输入文字</el-dropdown-item>
                    <el-dropdown-item command="keyCode">发送按键</el-dropdown-item>
                    <el-dropdown-item divided command="findNode">按ID查找节点</el-dropdown-item>
                    <el-dropdown-item command="findByDesc">按描述查找节点</el-dropdown-item>
                    <el-dropdown-item command="getNodes">获取节点树</el-dropdown-item>
                    <el-dropdown-item divided command="screenshot">截图</el-dropdown-item>
                    <el-dropdown-item command="ocr">OCR识别</el-dropdown-item>
                    <el-dropdown-item divided command="shell">执行Shell</el-dropdown-item>
                    <el-dropdown-item command="runApp">启动应用</el-dropdown-item>
                    <el-dropdown-item command="appList">应用列表</el-dropdown-item>
                    <el-dropdown-item command="file">文件读写</el-dropdown-item>
                    <el-dropdown-item command="toast">显示提示</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button type="primary" size="small" class="ml-2" @click="runScript" :loading="running" :disabled="!selectedDeviceId || !scriptCode.trim()">
                <el-icon><VideoPlay /></el-icon> 执行
              </el-button>
            </div>
          </div>
          <!-- 字符统计和超时设置 -->
          <div class="editor-toolbar">
            <span class="char-count">{{ scriptCode.length }} 字符</span>
            <div class="timeout-setting">
              <span class="timeout-label">超时:</span>
              <el-input-number v-model="timeout" :min="1000" :max="300000" :step="1000" size="small" style="width: 100px" />
              <span class="timeout-unit">ms</span>
            </div>
          </div>
          <div class="editor-container">
            <el-input
              type="textarea"
              v-model="scriptCode"
              placeholder="// AccBot SDK API&#10;// 全局: android, sleep, log&#10;&#10;// 触摸: android.touch.click(x,y)&#10;// 输入: android.input.inputStr(text)&#10;// 节点: android.acc.getNode(-1)&#10;// OCR: android.ocr.ocr(80)&#10;// Shell: android.shell.executeCommand(cmd)&#10;&#10;// 所有API需要 await"
              class="code-editor"
            />
          </div>
        </div>

        <!-- 执行结果（固定在底部） -->
        <div class="result-section">
          <div class="section-header">
            <span>执行结果</span>
            <el-tag v-if="execResult" :type="execResult.success ? 'success' : 'danger'" size="small">
              {{ execResult.success ? '成功' : '失败' }}
            </el-tag>
          </div>
          <div class="result-content-wrapper">
            <div v-if="!execResult" class="empty-result">
              <el-icon :size="32"><DataLine /></el-icon>
              <p>执行脚本后显示结果</p>
            </div>
            <div v-else class="result-content">
              <div class="result-meta">
                <span>耗时: {{ execResult.duration }}ms</span>
                <span v-if="execResult.timestamp">{{ formatTime(execResult.timestamp) }}</span>
              </div>
              <pre class="result-output">{{ formatResult(execResult) }}</pre>
              <div v-if="execResult.logs && execResult.logs.length > 0" class="result-logs">
                <div class="logs-header">日志输出:</div>
                <div v-for="(log, i) in execResult.logs" :key="i" class="log-line">{{ log }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚本仓库弹窗 -->
    <el-dialog v-model="showScriptRepo" title="代码仓库" width="700px" :close-on-click-modal="false">
      <div class="repo-header">
        <el-input v-model="repoSearchKey" placeholder="搜索脚本..." clearable style="width: 200px" @input="searchScripts" />
        <el-button type="primary" @click="showScriptEditor(null)">新建脚本</el-button>
      </div>
      <el-table :data="scriptList" v-loading="repoLoading" max-height="400px" @row-click="loadScriptFromRepo">
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="timeout" label="超时" width="100">
          <template #default="{ row }">{{ row.timeout === 0 ? '无限' : (row.timeout / 1000) + 's' }}</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="editScriptInMain(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click.stop="deleteScriptConfirm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showScriptRepo = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 脚本编辑弹窗 -->
    <el-dialog v-model="showScriptEdit" :title="editingScript?.id ? '编辑脚本' : '新建脚本'" width="600px" :close-on-click-modal="false">
      <el-form :model="editingScript" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="editingScript.name" placeholder="脚本名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editingScript.description" placeholder="脚本描述（可选）" />
        </el-form-item>
        <el-form-item label="超时">
          <el-input-number v-model="editingScript.timeout" :min="0" :max="300000" :step="1000" />
          <span class="ml-2" style="color: #909399">ms（0=无限）</span>
        </el-form-item>
        <el-form-item label="代码">
          <el-input v-model="editingScript.code" type="textarea" :rows="10" placeholder="脚本代码" class="code-textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScriptEdit = false">取消</el-button>
        <el-button type="primary" @click="saveScript" :loading="savingScript">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { backendApi } from '@/api/backendApi'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor, Refresh, Camera, VideoPlay, ArrowDown, Document, DataLine, Search,
  CaretRight, ArrowRight, Picture, Pointer, Edit, Grid, Box, FolderOpened, DocumentAdd, Close,
  ZoomIn, ZoomOut
} from '@element-plus/icons-vue'

// 设备相关
const wsDeviceList = ref<any[]>([])
const selectedDeviceId = ref<number | null>(null)
const selectedDevice = computed(() => wsDeviceList.value.find(d => d.deviceId === selectedDeviceId.value))

// Tab 切换
const leftTab = ref('screenshot')

// 截图相关
const screenshotSrc = ref('')
const screenshotInfo = ref<{ width: number; height: number } | null>(null)
const screenshotLoading = ref(false)
const autoRefreshScreen = ref(false)
const screenImage = ref<HTMLImageElement | null>(null)

// 图片拖拽和缩放相关
const imageOffset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
const imageScale = ref(100)  // 缩放百分比
const clickInfo = ref<{ x: number; y: number; color: string } | null>(null)

const imageStyle = computed(() => ({
  transform: `translate(${imageOffset.value.x}px, ${imageOffset.value.y}px) scale(${imageScale.value / 100})`,
  transformOrigin: 'top left',
  cursor: isDragging.value ? 'grabbing' : 'crosshair'
}))

// 节点相关
const nodesData = ref<any>(null)
const nodesLoading = ref(false)
const nodeSearchKey = ref('')
const expandedKeys = ref<Set<string>>(new Set())
const selectedNode = ref<any>(null)
const selectedNodeId = ref<string>('')

// OCR 相关
interface OcrItem {
  label: string
  qua: number
  x1: number
  y1: number
  x2: number
  y2: number
  x: number
  y: number
}
const ocrQuality = ref(80)
const ocrLoading = ref(false)
const ocrResults = ref<OcrItem[]>([])
const ocrExpandedKeys = ref<Set<number>>(new Set())
const selectedOcrIndex = ref<number | null>(null)
const selectedOcrItem = computed(() =>
  selectedOcrIndex.value !== null ? ocrResults.value[selectedOcrIndex.value] : null
)

// 脚本相关
const scriptCode = ref(`// 示例脚本
// 全局变量: android(SDK对象), sleep(延时), log(日志)

// 点击屏幕中心
await android.touch.click(540, 960);

// 等待 1 秒
await sleep(1000);

// 返回结果
return "执行完成";`)
const timeout = ref(30000)
const running = ref(false)
const execResult = ref<any>(null)

// 代码仓库相关
const showScriptRepo = ref(false)
const showScriptEdit = ref(false)
const scriptList = ref<any[]>([])
const repoLoading = ref(false)
const repoSearchKey = ref('')
const savingScript = ref(false)
const editingScript = ref<any>({ name: '', description: '', code: '', timeout: 30000 })
const currentScriptId = ref<number | null>(null) // 当前加载的脚本ID

// 当前脚本名称（计算属性）
const currentScriptName = computed(() => {
  if (!currentScriptId.value) return ''
  const script = scriptList.value.find(s => s.id === currentScriptId.value)
  return script?.name || ''
})

// 清除当前脚本（新建）
const clearCurrentScript = () => {
  currentScriptId.value = null
  scriptCode.value = ''
}

let refreshTimer: number | null = null

// 截断文本
const truncate = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

// 获取节点图标
const getNodeIcon = (node: any) => {
  const cls = node.className?.toLowerCase() || ''
  if (cls.includes('image') || cls.includes('icon')) return Picture
  if (cls.includes('button') || cls.includes('btn')) return Pointer
  if (cls.includes('edit') || cls.includes('input')) return Edit
  if (cls.includes('list') || cls.includes('recycler')) return Grid
  return Box
}

// 获取节点图标样式类
const getNodeIconClass = (node: any) => {
  const cls = node.className?.toLowerCase() || ''
  if (cls.includes('image') || cls.includes('icon')) return 'icon-image'
  if (cls.includes('button') || cls.includes('btn')) return 'icon-button'
  if (cls.includes('edit') || cls.includes('input')) return 'icon-input'
  if (cls.includes('text')) return 'icon-text'
  if (cls.includes('list') || cls.includes('recycler')) return 'icon-list'
  return 'icon-default'
}

// 扁平化节点树（用于虚拟滚动）
const flattenedNodes = computed(() => {
  if (!nodesData.value) return []
  const result: any[] = []
  const searchKey = nodeSearchKey.value.toLowerCase()

  const traverse = (node: any, depth: number, parentId: string) => {
    const nodeId = parentId ? `${parentId}_${result.length}` : `root_${result.length}`
    const hasChildren = node.children && node.children.length > 0
    const isMatch = searchKey && (
      (node.text && node.text.toLowerCase().includes(searchKey)) ||
      (node.className && node.className.toLowerCase().includes(searchKey)) ||
      (node.resourceId && node.resourceId.toLowerCase().includes(searchKey)) ||
      (node.contentDesc && node.contentDesc.toLowerCase().includes(searchKey))
    )

    result.push({
      id: nodeId,
      node,
      depth,
      hasChildren,
      isMatch
    })

    if (hasChildren && expandedKeys.value.has(nodeId)) {
      node.children.forEach((child: any, _index: number) => {
        traverse(child, depth + 1, nodeId)
      })
    }
  }

  traverse(nodesData.value, 0, '')
  return result
})

// 获取设备列表
const fetchWsDevices = async () => {
  try {
    const res = await backendApi.getWsDevices()
    wsDeviceList.value = res || []
    if (wsDeviceList.value.length > 0 && !selectedDeviceId.value) {
      selectedDeviceId.value = wsDeviceList.value[0].deviceId
    }
  } catch (e) {
    console.error('Failed to load WS devices', e)
  }
}

// 设备切换
const handleDeviceChange = () => {
  screenshotSrc.value = ''
  screenshotInfo.value = null
  nodesData.value = null
  execResult.value = null
  clickInfo.value = null
  selectedNode.value = null
  selectedNodeId.value = ''
  if (selectedDeviceId.value) {
    takeScreenshot()
  }
}

// 截图
const takeScreenshot = async () => {
  if (!selectedDeviceId.value) return
  screenshotLoading.value = true
  try {
    const requestTime = Date.now()
    await backendApi.requestWsScreenshot(selectedDeviceId.value)

    let retries = 0
    while (retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 500))
      try {
        const data = await backendApi.getWsScreenshot(selectedDeviceId.value)
        if (data?.data && data.timestamp && data.timestamp > requestTime) {
          screenshotInfo.value = { width: data.width, height: data.height }
          screenshotSrc.value = 'data:image/png;base64,' + data.data
          resetImagePosition()  // 重置图片位置
          return
        } else if (data?.data && !data.timestamp) {
          screenshotInfo.value = { width: data.width, height: data.height }
          screenshotSrc.value = 'data:image/png;base64,' + data.data
          resetImagePosition()  // 重置图片位置
          return
        }
      } catch (e) { /* continue */ }
      retries++
    }
    ElMessage.warning('截图超时，请重试')
  } catch (e: any) {
    ElMessage.error('截图失败: ' + e.message)
  } finally {
    screenshotLoading.value = false
  }
}

// 图片拖拽移动
const startImageDrag = (e: MouseEvent) => {
  // 只响应鼠标左键
  if (e.button !== 0) return

  isDragging.value = true
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    offsetX: imageOffset.value.x,
    offsetY: imageOffset.value.y
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    const dx = e.clientX - dragStart.value.x
    const dy = e.clientY - dragStart.value.y
    imageOffset.value = {
      x: dragStart.value.offsetX + dx,
      y: dragStart.value.offsetY + dy
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    // 如果移动距离很小，视为点击
    const dx = Math.abs(e.clientX - dragStart.value.x)
    const dy = Math.abs(e.clientY - dragStart.value.y)
    if (dx < 5 && dy < 5) {
      // 触发点击坐标获取
      handleScreenClickInternal(e)
    }
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

// 重置图片位置
const resetImagePosition = () => {
  imageOffset.value = { x: 0, y: 0 }
}

// 点击截图获取坐标和颜色
const handleScreenClickInternal = (e: MouseEvent) => {
  if (!screenImage.value) return
  const img = screenImage.value
  const rect = img.getBoundingClientRect()

  // 考虑缩放比例计算实际点击位置
  const scale = imageScale.value / 100
  const imgX = (e.clientX - rect.left) / scale
  const imgY = (e.clientY - rect.top) / scale

  const screenWidth = screenshotInfo.value?.width || selectedDevice.value?.screenWidth || 1080
  const screenHeight = screenshotInfo.value?.height || selectedDevice.value?.screenHeight || 1920

  const deviceX = Math.round(imgX / img.naturalWidth * screenWidth)
  const deviceY = Math.round(imgY / img.naturalHeight * screenHeight)

  // 获取点击位置的颜色
  const color = getPixelColor(img, Math.round(imgX), Math.round(imgY))
  clickInfo.value = { x: deviceX, y: deviceY, color }
}

// 获取图片指定位置的颜色
const getPixelColor = (img: HTMLImageElement, x: number, y: number): string => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return '#000000'
    ctx.drawImage(img, 0, 0)
    const pixel = ctx.getImageData(x, y, 1, 1).data
    const r = pixel[0] ?? 0
    const g = pixel[1] ?? 0
    const b = pixel[2] ?? 0
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  } catch {
    return '#000000'
  }
}

// 点击截图获取坐标（兼容旧调用，现在由拖拽逻辑处理）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleScreenClick = (_e: MouseEvent) => {
  // 由 startImageDrag 的 mouseup 处理
}

// OCR 识别
const runOcr = async () => {
  if (!selectedDeviceId.value) return
  ocrLoading.value = true
  ocrResults.value = []
  selectedOcrIndex.value = null

  try {
    const script = `let results = await android.ocr.ocr(${ocrQuality.value});
return JSON.stringify(results, null, 2);`

    const debugId = `ocr_${Date.now()}`
    await backendApi.sendWsDebug(selectedDeviceId.value, debugId, script, 30000)

    let retries = 0
    while (retries < 60) {
      await new Promise(resolve => setTimeout(resolve, 500))
      try {
        const result = await backendApi.getWsDebugResult(selectedDeviceId.value!, debugId)
        if (result) {
          // 有结果返回
          if (result.success && result.result) {
            const parsed = JSON.parse(result.result)
            ocrResults.value = Array.isArray(parsed) ? parsed : []
            // 按置信度排序
            ocrResults.value.sort((a, b) => b.qua - a.qua)
            ElMessage.success(`识别到 ${ocrResults.value.length} 个文本`)
          } else if (result.error) {
            ElMessage.error('OCR 识别失败: ' + result.error)
          }
          break
        }
      } catch (e) { /* continue polling */ }
      retries++
    }

    if (retries >= 60) {
      ElMessage.warning('OCR 识别超时，请重试')
    }
  } catch (e: any) {
    ElMessage.error('OCR 识别失败: ' + e.message)
  } finally {
    ocrLoading.value = false
  }
}

// OCR 展开/收起
const toggleOcrItem = (index: number) => {
  if (ocrExpandedKeys.value.has(index)) {
    ocrExpandedKeys.value.delete(index)
  } else {
    ocrExpandedKeys.value.add(index)
  }
  ocrExpandedKeys.value = new Set(ocrExpandedKeys.value)
}

const expandAllOcr = () => {
  ocrExpandedKeys.value = new Set(ocrResults.value.map((_, i) => i))
}

const collapseAllOcr = () => {
  ocrExpandedKeys.value = new Set()
}

const selectOcrItem = (index: number, _item: OcrItem) => {
  selectedOcrIndex.value = index
  if (!ocrExpandedKeys.value.has(index)) {
    ocrExpandedKeys.value.add(index)
    ocrExpandedKeys.value = new Set(ocrExpandedKeys.value)
  }
}

const insertOcrClickCode = () => {
  if (!selectedOcrItem.value) return
  const code = `await android.touch.click(${selectedOcrItem.value.x}, ${selectedOcrItem.value.y});`
  if (scriptCode.value.trim()) {
    scriptCode.value += '\n' + code
  } else {
    scriptCode.value = code
  }
  ElMessage.success('已插入点击代码')
}

const copyOcrInfo = () => {
  if (!selectedOcrItem.value) return
  navigator.clipboard.writeText(JSON.stringify(selectedOcrItem.value, null, 2))
  ElMessage.success('已复制到剪贴板')
}

// 获取节点
const getNodes = async () => {
  if (!selectedDeviceId.value) return
  nodesLoading.value = true
  nodesData.value = null
  selectedNode.value = null
  selectedNodeId.value = ''

  try {
    const requestId = `nodes_${Date.now()}`
    await backendApi.requestWsNodes(selectedDeviceId.value, { requestId, visibleOnly: true })

    let retries = 0
    while (retries < 15) {
      await new Promise(resolve => setTimeout(resolve, 800))
      try {
        const result = await backendApi.getWsNodes(selectedDeviceId.value!)
        if (result && result.nodes) {
          nodesData.value = result.nodes
          // 默认展开根节点
          expandedKeys.value = new Set(['root_0'])
          break
        }
      } catch (e) { /* continue */ }
      retries++
    }

    if (!nodesData.value) {
      ElMessage.warning('获取节点超时，请重试')
    }
  } catch (e: any) {
    ElMessage.error('获取节点失败: ' + e.message)
  } finally {
    nodesLoading.value = false
  }
}

// 展开/收起节点
const toggleNode = (nodeId: string) => {
  if (expandedKeys.value.has(nodeId)) {
    expandedKeys.value.delete(nodeId)
  } else {
    expandedKeys.value.add(nodeId)
  }
  expandedKeys.value = new Set(expandedKeys.value)
}

// 全部展开
const expandAllNodes = () => {
  const keys = new Set<string>()
  flattenedNodes.value.forEach(item => {
    if (item.hasChildren) {
      keys.add(item.id)
    }
  })
  // 递归展开所有
  const expandRecursive = () => {
    const newKeys = new Set(keys)
    flattenedNodes.value.forEach(item => {
      if (item.hasChildren) {
        newKeys.add(item.id)
      }
    })
    if (newKeys.size > keys.size) {
      keys.clear()
      newKeys.forEach(k => keys.add(k))
      expandedKeys.value = new Set(keys)
      setTimeout(expandRecursive, 10)
    }
  }
  expandedKeys.value = keys
  setTimeout(expandRecursive, 10)
}

// 全部收起
const collapseAllNodes = () => {
  expandedKeys.value = new Set()
}

// 选中节点
const selectNodeById = (nodeId: string, node: any) => {
  selectedNodeId.value = nodeId
  selectedNode.value = node
}

// 选中节点的属性
const selectedNodeProps = computed(() => {
  if (!selectedNode.value) return {}
  const n = selectedNode.value
  const props: Record<string, any> = {}
  if (n.className) props['类名'] = n.className.split('.').pop()
  if (n.text) props['文本'] = n.text
  if (n.resourceId) props['ID'] = n.resourceId.split('/').pop()
  if (n.contentDesc) props['描述'] = n.contentDesc
  if (n.bounds) props['边界'] = `[${n.bounds.join(',')}]`
  if (n.clickable) props['可点击'] = '是'
  if (n.scrollable) props['可滚动'] = '是'
  if (n.packageName) props['包名'] = n.packageName
  return props
})

// 复制节点信息
const copyNodeInfo = () => {
  if (!selectedNode.value) return
  navigator.clipboard.writeText(JSON.stringify(selectedNode.value, null, 2))
  ElMessage.success('已复制节点JSON')
}

// 插入节点代码
const insertNodeCode = () => {
  if (!selectedNode.value) return
  const n = selectedNode.value
  let code = ''
  if (n.resourceId) {
    code = `let node = await android.acc.findViewById("${n.resourceId}");\nif (node) await node.click();`
  } else if (n.contentDesc) {
    code = `let node = await android.acc.findViewByDesc("${n.contentDesc}");\nif (node) await node.click();`
  } else if (n.text) {
    code = `// 按文本查找: "${n.text}"\nlet root = await android.acc.getNode(-1);\n// TODO: 遍历查找`
  }
  if (code) {
    scriptCode.value += '\n' + code
    ElMessage.success('已插入代码')
  }
}

// 搜索匹配高亮
const isSearchMatch = (value: string) => {
  if (!nodeSearchKey.value) return false
  return value.toLowerCase().includes(nodeSearchKey.value.toLowerCase())
}

// 执行脚本
const runScript = async () => {
  if (!selectedDeviceId.value || !scriptCode.value.trim()) return
  running.value = true
  execResult.value = null

  try {
    const debugId = `debug_${Date.now()}`
    await backendApi.sendWsDebug(selectedDeviceId.value, debugId, scriptCode.value, timeout.value)

    let retries = 0
    const maxRetries = Math.ceil(timeout.value / 1000) + 5
    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        const result = await backendApi.getWsDebugResult(selectedDeviceId.value!, debugId)
        if (result) {
          execResult.value = result
          if (autoRefreshScreen.value) {
            setTimeout(() => takeScreenshot(), 500)
          }
          break
        }
      } catch (e) { /* continue */ }
      retries++
    }

    if (!execResult.value) {
      execResult.value = { success: false, error: '执行超时', duration: timeout.value }
    }
  } catch (e: any) {
    execResult.value = { success: false, error: e.message, duration: 0 }
  } finally {
    running.value = false
  }
}

// 加载模板
const loadTemplate = (template: string) => {
  const templates: Record<string, string> = {
    click: `// 点击指定坐标
await android.touch.click(540, 960);
return "点击完成";`,
    longClick: `// 长按指定坐标 (x, y, 持续毫秒)
await android.touch.longClick(540, 960, 1000);
return "长按完成";`,
    swipe: `// 滑动操作 (x1, y1, x2, y2, 持续毫秒)
await android.touch.swipe(540, 1200, 540, 400, 500);
return "滑动完成";`,
    text: `// 输入文字
await android.input.inputStr("Hello World");
return "输入完成";`,
    findNode: `// 按资源ID查找节点并点击
let node = await android.acc.findViewById("com.example:id/btn_login");
if (node) {
    await node.click();
    return "点击成功";
} else {
    return "未找到节点";
}`,
    findByDesc: `// 按描述查找节点并点击
let node = await android.acc.findViewByDesc("登录");
if (node) {
    await node.click();
    return "点击成功";
} else {
    return "未找到节点";
}`,
    getNodes: `// 获取当前界面节点树
let root = await android.acc.getNode(-1);
let json = root.toJson();
return json;`,
    screenshot: `// 截图并返回 Base64
let img = await android.image.getImg();
let base64 = img.getBase64();
return base64.substring(0, 100) + "...";`,
    ocr: `// OCR 文字识别
let results = await android.ocr.ocr(80);
return JSON.stringify(results, null, 2);`,
    shell: `// 执行 Shell 命令
let result = await android.shell.executeCommand("ls -la /sdcard/");
return result;`,
    runApp: `// 启动应用
await android.app.runApp("com.tencent.mm");
return "应用已启动";`,
    appList: `// 获取已安装应用列表
let apps = await android.app.getAppList();
return JSON.stringify(apps, null, 2);`,
    file: `// 文件读写
await android.file.writeStr("/sdcard/test.txt", "Hello World", false);
let content = await android.file.readStr("/sdcard/test.txt");
return content;`,
    toast: `// 显示提示
await android.app.toast("操作完成", 2000);
return "已显示提示";`,
    keyCode: `// 发送按键 (4=返回, 3=Home, 66=回车)
await android.input.setKeyCode(66);
return "已发送回车键";`
  }

  if (templates[template]) {
    scriptCode.value = templates[template]
  }
}

// 格式化结果
const formatResult = (result: any) => {
  if (result.error) return result.error
  if (result.result !== undefined) {
    return typeof result.result === 'object'
      ? JSON.stringify(result.result, null, 2)
      : String(result.result)
  }
  return '(无返回值)'
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

// ========== 代码仓库方法 ==========

// 加载脚本列表
const loadScripts = async () => {
  repoLoading.value = true
  try {
    scriptList.value = await backendApi.getScripts() || []
  } catch (e: any) {
    ElMessage.error('加载脚本列表失败: ' + e.message)
  } finally {
    repoLoading.value = false
  }
}

// 搜索脚本
const searchScripts = async () => {
  repoLoading.value = true
  try {
    scriptList.value = await backendApi.getScripts(repoSearchKey.value) || []
  } catch (e: any) {
    ElMessage.error('搜索失败: ' + e.message)
  } finally {
    repoLoading.value = false
  }
}

// 显示脚本编辑弹窗
const showScriptEditor = (script: any) => {
  if (script) {
    editingScript.value = { ...script }
  } else {
    editingScript.value = { name: '', description: '', code: scriptCode.value, timeout: timeout.value }
  }
  showScriptEdit.value = true
}

// 保存脚本
const saveScript = async () => {
  if (!editingScript.value.name?.trim()) {
    ElMessage.warning('请输入脚本名称')
    return
  }
  savingScript.value = true
  try {
    if (editingScript.value.id) {
      await backendApi.updateScript(editingScript.value.id, editingScript.value)
      ElMessage.success('脚本已更新')
    } else {
      const result = await backendApi.createScript(editingScript.value)
      editingScript.value.id = result.id
      ElMessage.success('脚本已保存')
    }
    showScriptEdit.value = false
    loadScripts()
  } catch (e: any) {
    ElMessage.error('保存失败: ' + e.message)
  } finally {
    savingScript.value = false
  }
}

// 从仓库加载脚本到编辑器
const loadScriptFromRepo = (row: any) => {
  scriptCode.value = row.code
  timeout.value = row.timeout || 30000
  currentScriptId.value = row.id
  showScriptRepo.value = false
  ElMessage.success(`已加载脚本: ${row.name}`)
}

// 编辑脚本（加载到主编辑器）
const editScriptInMain = (row: any) => {
  scriptCode.value = row.code
  timeout.value = row.timeout || 30000
  currentScriptId.value = row.id
  showScriptRepo.value = false
  ElMessage.success(`正在编辑: ${row.name}`)
}

// 保存当前编辑器中的脚本
const saveCurrentScript = () => {
  if (currentScriptId.value) {
    // 更新已有脚本
    editingScript.value = {
      id: currentScriptId.value,
      name: scriptList.value.find(s => s.id === currentScriptId.value)?.name || '未命名脚本',
      description: scriptList.value.find(s => s.id === currentScriptId.value)?.description || '',
      code: scriptCode.value,
      timeout: timeout.value
    }
  } else {
    // 新建脚本
    editingScript.value = {
      name: '',
      description: '',
      code: scriptCode.value,
      timeout: timeout.value
    }
  }
  showScriptEdit.value = true
}

// 删除脚本确认
const deleteScriptConfirm = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除脚本「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    })
    await backendApi.deleteScript(row.id)
    ElMessage.success('删除成功')
    if (currentScriptId.value === row.id) {
      currentScriptId.value = null
    }
    loadScripts()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败: ' + e.message)
    }
  }
}

// watch showScriptRepo
watch(showScriptRepo, (val) => {
  if (val) loadScripts()
})

onMounted(() => {
  fetchWsDevices()
  refreshTimer = window.setInterval(fetchWsDevices, 10000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped lang="scss">
.script-debug-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .device-option {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .device-serial { font-weight: 500; }
    .device-info { color: #999; font-size: 12px; }
  }
}

.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.preview-section {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.preview-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 12px;
    background: #fafafa;
    border-bottom: 1px solid #eee;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.tab-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.screen-container {
  flex: 1;
  position: relative;
  background: #1a1a1a;
  min-height: 300px;
  overflow: auto;  // 允许滚动
}

.screen-image {
  display: block;
  cursor: crosshair;
  user-select: none;
  // 原尺寸显示，不缩放
}

.empty-screen, .empty-nodes, .empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
  height: 100%;
  p { margin: 0; font-size: 12px; }
}

// 右上角信息面板
.click-info-panel {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  z-index: 10;

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    &:last-child { margin-bottom: 0; }
  }

  .info-label {
    color: #aaa;
  }

  .info-value {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .color-preview {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    border: 1px solid rgba(255,255,255,0.3);
  }
}

// 缩放滑块
.zoom-slider {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.75);
  padding: 6px 12px;
  border-radius: 6px;
  color: #fff;
  z-index: 10;

  .el-icon {
    font-size: 14px;
    color: #aaa;
  }

  .zoom-value {
    font-size: 11px;
    color: #aaa;
    min-width: 35px;
  }

  :deep(.el-slider__runway) {
    background: rgba(255,255,255,0.2);
  }

  :deep(.el-slider__bar) {
    background: #409eff;
  }

  :deep(.el-slider__button) {
    width: 12px;
    height: 12px;
  }
}

// OCR 样式
.ocr-quality-label {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.ocr-container {
  flex: 1;
  overflow: auto;
  background: #fff;
}

.ocr-list {
  padding: 4px 0;
}

.ocr-item {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &.is-selected {
    background: #ecf5ff;
  }

  .ocr-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ocr-expand {
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;

    .el-icon {
      transition: transform 0.2s;
      &.is-expanded {
        transform: rotate(90deg);
      }
    }
  }

  .ocr-label {
    flex: 1;
    font-size: 13px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ocr-item-detail {
    margin-top: 8px;
    padding: 8px;
    background: #fafafa;
    border-radius: 4px;
    font-size: 12px;

    .detail-row {
      display: flex;
      margin-bottom: 4px;
      &:last-child { margin-bottom: 0; }
    }

    .detail-key {
      width: 60px;
      color: #909399;
      flex-shrink: 0;
    }

    .detail-value {
      color: #606266;
      font-family: monospace;
    }
  }
}

// 节点树样式
.nodes-container {
  flex: 1;
  overflow: auto;
  background: #fff;
}

.node-tree-wrapper {
  padding: 4px 0;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;

  &:hover {
    background: #f5f7fa;
  }

  &.is-selected {
    background: #ecf5ff;
    border-left-color: #409eff;

    .tree-label .node-class {
      color: #409eff;
      font-weight: 600;
    }
  }

  &.is-match {
    background: #fef9e7;

    .tree-label {
      .node-class, .node-text, .node-id {
        color: #e67e22;
      }
    }
  }
}

.tree-expand {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #909399;
  transition: transform 0.2s;

  .el-icon {
    font-size: 12px;
    transition: transform 0.2s;

    &.is-expanded {
      transform: rotate(90deg);
    }
  }

  &.is-leaf {
    .leaf-dot {
      width: 4px;
      height: 4px;
      background: #dcdfe6;
      border-radius: 50%;
    }
  }
}

.tree-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  border-radius: 4px;
  font-size: 12px;

  &.icon-image { background: #fef0f0; color: #f56c6c; }
  &.icon-button { background: #f0f9eb; color: #67c23a; }
  &.icon-input { background: #fdf6ec; color: #e6a23c; }
  &.icon-text { background: #ecf5ff; color: #409eff; }
  &.icon-list { background: #f4f4f5; color: #909399; }
  &.icon-default { background: #f5f7fa; color: #606266; }
}

.tree-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12px;

  .node-class {
    color: #303133;
    font-weight: 500;
  }

  .node-text {
    color: #67c23a;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-id {
    color: #909399;
    font-size: 11px;
  }
}

.tree-badge {
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: auto;

  &.clickable {
    background: #e1f3d8;
    color: #67c23a;
  }
}

// 节点详情
.node-detail {
  border-top: 1px solid #eee;
  background: #fafafa;
  max-height: 180px;
  overflow: auto;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f5f5f5;
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    position: sticky;
    top: 0;
  }

  .detail-actions {
    display: flex;
    gap: 8px;
  }

  .detail-content {
    padding: 8px 12px;
  }

  .detail-row {
    display: flex;
    font-size: 11px;
    line-height: 1.8;
    gap: 8px;

    .detail-key {
      color: #909399;
      min-width: 50px;
      flex-shrink: 0;
    }

    .detail-value {
      color: #303133;
      word-break: break-all;

      &.highlight {
        background: #ffc107;
        padding: 0 2px;
        border-radius: 2px;
      }
    }
  }
}

// 右侧区域
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  position: relative;
  padding-bottom: 160px;  // 给底部结果区域留空间
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 13px;
  color: #303133;

  // 编辑器标题栏（与左侧 Tab 对齐，不需要额外高度）
  &.editor-header {
    // 使用默认 padding，不加 min-height
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 4px;

    .current-script-name {
      font-weight: 400;
      color: #409eff;
      font-size: 12px;

      &.new-script {
        color: #909399;
        font-style: italic;
      }

      .el-button {
        margin-left: 4px;
        color: #909399;
        &:hover {
          color: #f56c6c;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
  }
}

// 编辑器工具栏（字符统计和超时设置）
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  color: #909399;

  .char-count {
    color: #606266;
  }

  .timeout-setting {
    display: flex;
    align-items: center;
    gap: 6px;

    .timeout-label {
      color: #909399;
    }

    .timeout-unit {
      color: #909399;
    }
  }
}

.editor-container {
  flex: 1;
  min-height: 0;
}

.code-editor {
  height: 100%;

  :deep(.el-textarea__inner) {
    height: 100% !important;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    background: #1e1e1e;
    color: #d4d4d4;
    border: none;
    border-radius: 0;
    resize: none;
    padding: 12px;
  }
}

// 拖拽分隔条
.resize-bar {
  height: 8px;
  background: #e4e7ed;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #d3d6db;
  }

  .resize-handle {
    width: 40px;
    height: 4px;
    background: #c0c4cc;
    border-radius: 2px;
  }
}

.result-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  height: 150px;
}

.result-content-wrapper {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.result-content {
  .result-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #909399;
    margin-bottom: 8px;
  }

  .result-output {
    margin: 0;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
    color: #303133;
  }

  .result-logs {
    margin-top: 12px;
    padding: 10px;
    background: #1e1e1e;
    border-radius: 4px;
    max-height: 120px;
    overflow: auto;

    .logs-header {
      color: #909399;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .log-line {
      color: #d4d4d4;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.4;
    }
  }
}

.ml-2 { margin-left: 8px; }

// 代码仓库弹窗样式
.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.code-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
