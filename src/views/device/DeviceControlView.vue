<!-- 脚本调试页面 - 专用于脚本APK调试 -->
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
              <img v-else :src="screenshotSrc" class="screen-image" @click="handleScreenClick" ref="screenImage" />
              <div v-if="clickCoord" class="click-marker" :style="clickMarkerStyle">
                <span class="coord-text">{{ clickCoord.x }}, {{ clickCoord.y }}</span>
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
                placeholder="搜索节点..."
                size="small"
                clearable
                style="width: 160px"
                :prefix-icon="Search"
              />
              <el-button size="small" @click="getNodes" :loading="nodesLoading" :disabled="!selectedDeviceId">
                <el-icon><Refresh /></el-icon> 获取
              </el-button>
              <el-button size="small" @click="expandAllNodes" :disabled="!nodesData">全展</el-button>
              <el-button size="small" @click="collapseAllNodes" :disabled="!nodesData">全收</el-button>
            </div>
            <div class="nodes-container">
              <div v-if="!nodesData" class="empty-nodes">
                <el-icon :size="48"><Document /></el-icon>
                <p>点击获取按钮获取节点树</p>
              </div>
              <div v-else class="node-tree-wrapper">
                <NodeTreeItem
                  v-for="(node, index) in filteredNodes"
                  :key="index"
                  :node="node"
                  :search-key="nodeSearchKey"
                  :expanded-keys="expandedKeys"
                  @toggle="toggleNode"
                  @select="selectNode"
                />
              </div>
            </div>
            <div v-if="selectedNode" class="node-detail">
              <div class="detail-header">
                <span>节点详情</span>
                <el-button size="small" link @click="copyNodeInfo">复制</el-button>
              </div>
              <div class="detail-content">
                <div v-for="(value, key) in selectedNodeProps" :key="key" class="detail-row">
                  <span class="detail-key">{{ key }}:</span>
                  <span class="detail-value" :class="{ highlight: isSearchMatch(String(value)) }">{{ value }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中间：脚本编辑器 -->
      <div class="editor-section">
        <div class="section-header">
          <span>脚本编辑器</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="runScript" :loading="running" :disabled="!selectedDeviceId || !scriptCode.trim()">
              <el-icon><VideoPlay /></el-icon> 执行
            </el-button>
            <el-dropdown @command="loadTemplate" class="ml-2">
              <el-button size="small">
                模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="click">点击坐标</el-dropdown-item>
                  <el-dropdown-item command="swipe">滑动操作</el-dropdown-item>
                  <el-dropdown-item command="text">输入文字</el-dropdown-item>
                  <el-dropdown-item command="findNode">查找节点</el-dropdown-item>
                  <el-dropdown-item command="waitNode">等待节点</el-dropdown-item>
                  <el-dropdown-item command="screenshot">截图保存</el-dropdown-item>
                  <el-dropdown-item command="shell">执行Shell</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="editor-container">
          <el-input
            type="textarea"
            v-model="scriptCode"
            :rows="20"
            placeholder="// 在此编写脚本代码&#10;// 可用对象: device, ui, shell&#10;&#10;// 示例: 点击坐标&#10;device.click(500, 800);&#10;&#10;// 示例: 查找并点击节点&#10;let node = ui.findOne(text('登录'));&#10;if (node) node.click();"
            class="code-editor"
          />
        </div>
        <div class="editor-footer">
          <span class="char-count">{{ scriptCode.length }} 字符</span>
          <el-input-number v-model="timeout" :min="1000" :max="300000" :step="1000" size="small" style="width: 120px" />
          <span class="timeout-label">ms 超时</span>
        </div>
      </div>

      <!-- 右侧：执行结果 -->
      <div class="result-section">
        <div class="section-header">
          <span>执行结果</span>
          <el-tag v-if="execResult" :type="execResult.success ? 'success' : 'danger'" size="small">
            {{ execResult.success ? '成功' : '失败' }}
          </el-tag>
        </div>
        <div class="result-content-wrapper">
          <div v-if="!execResult" class="empty-result">
            <el-icon :size="48"><DataLine /></el-icon>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { backendApi } from '@/api/backendApi'
import { ElMessage } from 'element-plus'
import {
  Monitor, Refresh, Camera, VideoPlay, ArrowDown, Document, DataLine, Search
} from '@element-plus/icons-vue'

// 节点树组件
const NodeTreeItem = {
  name: 'NodeTreeItem',
  props: {
    node: { type: Object, required: true },
    searchKey: { type: String, default: '' },
    expandedKeys: { type: Set, required: true },
    depth: { type: Number, default: 0 }
  },
  emits: ['toggle', 'select'],
  setup(props: any, { emit }: any) {
    const nodeId = computed(() => props.node._id || `${props.depth}_${props.node.className}_${props.node.text || ''}`)
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
    const isExpanded = computed(() => props.expandedKeys.has(nodeId.value))

    const getDisplayText = () => {
      const n = props.node
      let text = n.className || 'Node'
      if (n.text) text += ` "${n.text.substring(0, 20)}${n.text.length > 20 ? '...' : ''}"`
      if (n.resourceId) text += ` #${n.resourceId.split('/').pop()}`
      return text
    }

    const isMatch = computed(() => {
      if (!props.searchKey) return false
      const key = props.searchKey.toLowerCase()
      const n = props.node
      return (n.text && n.text.toLowerCase().includes(key)) ||
             (n.className && n.className.toLowerCase().includes(key)) ||
             (n.resourceId && n.resourceId.toLowerCase().includes(key)) ||
             (n.contentDesc && n.contentDesc.toLowerCase().includes(key))
    })

    return () => {
      const children = []

      // 节点行
      children.push(
        h('div', {
          class: ['node-item', { 'is-match': isMatch.value }],
          style: { paddingLeft: `${props.depth * 16}px` },
          onClick: () => emit('select', props.node)
        }, [
          h('span', {
            class: ['expand-icon', { 'is-leaf': !hasChildren.value }],
            onClick: (e: Event) => {
              e.stopPropagation()
              if (hasChildren.value) emit('toggle', nodeId.value)
            }
          }, hasChildren.value ? (isExpanded.value ? '▼' : '▶') : '•'),
          h('span', { class: 'node-text' }, getDisplayText())
        ])
      )

      // 子节点
      if (hasChildren.value && isExpanded.value) {
        props.node.children.forEach((child: any, index: number) => {
          child._id = `${nodeId.value}_${index}`
          children.push(
            h(NodeTreeItem, {
              node: child,
              searchKey: props.searchKey,
              expandedKeys: props.expandedKeys,
              depth: props.depth + 1,
              onToggle: (id: string) => emit('toggle', id),
              onSelect: (n: any) => emit('select', n)
            })
          )
        })
      }

      return h('div', { class: 'node-tree-item' }, children)
    }
  }
}

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
const clickCoord = ref<{ x: number; y: number; imgX: number; imgY: number } | null>(null)

// 节点相关
const nodesData = ref<any>(null)
const nodesLoading = ref(false)
const nodeSearchKey = ref('')
const expandedKeys = ref<Set<string>>(new Set())
const selectedNode = ref<any>(null)

// 脚本相关
const scriptCode = ref(`// 示例脚本
// 点击屏幕中心
device.click(540, 960);

// 等待 1 秒
sleep(1000);

// 返回结果
return "执行完成";`)
const timeout = ref(30000)
const running = ref(false)
const execResult = ref<any>(null)

let refreshTimer: number | null = null

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
  clickCoord.value = null
  selectedNode.value = null
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
          return
        } else if (data?.data && !data.timestamp) {
          screenshotInfo.value = { width: data.width, height: data.height }
          screenshotSrc.value = 'data:image/png;base64,' + data.data
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

// 点击截图获取坐标
const handleScreenClick = (e: MouseEvent) => {
  if (!screenImage.value) return
  const img = screenImage.value
  const rect = img.getBoundingClientRect()
  const imgX = e.clientX - rect.left
  const imgY = e.clientY - rect.top

  const screenWidth = screenshotInfo.value?.width || selectedDevice.value?.screenWidth || 1080
  const screenHeight = screenshotInfo.value?.height || selectedDevice.value?.screenHeight || 1920

  const deviceX = Math.round(imgX / rect.width * screenWidth)
  const deviceY = Math.round(imgY / rect.height * screenHeight)

  clickCoord.value = { x: deviceX, y: deviceY, imgX, imgY }

  const clickCode = `device.click(${deviceX}, ${deviceY});`
  if (scriptCode.value.trim()) {
    scriptCode.value += '\n' + clickCode
  } else {
    scriptCode.value = clickCode
  }
}

const clickMarkerStyle = computed(() => {
  if (!clickCoord.value) return {}
  return {
    left: clickCoord.value.imgX + 'px',
    top: clickCoord.value.imgY + 'px'
  }
})

// 获取节点
const getNodes = async () => {
  if (!selectedDeviceId.value) return
  nodesLoading.value = true
  nodesData.value = null
  selectedNode.value = null

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
          // 默认展开第一层
          expandedKeys.value = new Set(['0_' + (result.nodes.className || 'Node') + '_' + (result.nodes.text || '')])
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

// 过滤节点（搜索时显示匹配的节点路径）
const filteredNodes = computed(() => {
  if (!nodesData.value) return []
  return [nodesData.value]
})

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
  const traverse = (node: any, prefix: string) => {
    keys.add(prefix)
    if (node.children) {
      node.children.forEach((child: any, index: number) => {
        const childId = `${prefix}_${index}`
        child._id = childId
        traverse(child, childId)
      })
    }
  }
  if (nodesData.value) {
    const rootId = '0_' + (nodesData.value.className || 'Node') + '_' + (nodesData.value.text || '')
    traverse(nodesData.value, rootId)
  }
  expandedKeys.value = keys
}

// 全部收起
const collapseAllNodes = () => {
  expandedKeys.value = new Set()
}

// 选中节点
const selectNode = (node: any) => {
  selectedNode.value = node
}

// 选中节点的属性
const selectedNodeProps = computed(() => {
  if (!selectedNode.value) return {}
  const n = selectedNode.value
  const props: Record<string, any> = {}
  if (n.className) props['类名'] = n.className
  if (n.text) props['文本'] = n.text
  if (n.resourceId) props['资源ID'] = n.resourceId
  if (n.contentDesc) props['描述'] = n.contentDesc
  if (n.bounds) props['边界'] = `[${n.bounds.join(',')}]`
  if (n.clickable !== undefined) props['可点击'] = n.clickable ? '是' : '否'
  if (n.scrollable !== undefined) props['可滚动'] = n.scrollable ? '是' : '否'
  if (n.enabled !== undefined) props['启用'] = n.enabled ? '是' : '否'
  if (n.focused !== undefined) props['聚焦'] = n.focused ? '是' : '否'
  if (n.selected !== undefined) props['选中'] = n.selected ? '是' : '否'
  if (n.packageName) props['包名'] = n.packageName
  return props
})

// 复制节点信息
const copyNodeInfo = () => {
  if (!selectedNode.value) return
  navigator.clipboard.writeText(JSON.stringify(selectedNode.value, null, 2))
  ElMessage.success('已复制节点信息')
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
device.click(540, 960);`,
    swipe: `// 滑动操作 (从 x1,y1 滑动到 x2,y2)
device.swipe(540, 1200, 540, 400, 500);`,
    text: `// 输入文字
device.inputText("Hello World");`,
    findNode: `// 查找节点并点击
let node = ui.findOne(text("登录"));
if (node) {
    node.click();
    return "点击成功";
} else {
    return "未找到节点";
}`,
    waitNode: `// 等待节点出现
let node = ui.waitFor(text("确定"), 5000);
if (node) {
    node.click();
    return "等待成功并点击";
} else {
    return "等待超时";
}`,
    screenshot: `// 截图并保存
let path = device.screenshot("/sdcard/test.png");
return "截图保存到: " + path;`,
    shell: `// 执行 Shell 命令
let result = shell("ls -la /sdcard/");
return result;`
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
  background: #f5f5f5;
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
  width: 360px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.preview-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 12px;
    background: #fafafa;
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
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.screen-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.empty-screen, .empty-nodes, .empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  p { margin: 0; font-size: 12px; }
}

.screen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: crosshair;
}

.click-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid #ff4444;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .coord-text {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(255, 68, 68, 0.9);
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    white-space: nowrap;
  }
}

.nodes-container {
  flex: 1;
  overflow: auto;
  background: #fafafa;
}

.node-tree-wrapper {
  padding: 8px;
  font-size: 12px;
  font-family: monospace;
}

.node-tree-item {
  .node-item {
    display: flex;
    align-items: center;
    padding: 3px 8px;
    cursor: pointer;
    border-radius: 4px;
    white-space: nowrap;

    &:hover {
      background: #e8f4ff;
    }

    &.is-match {
      background: #fff3cd;
    }
  }

  .expand-icon {
    width: 16px;
    font-size: 10px;
    color: #999;
    flex-shrink: 0;

    &.is-leaf {
      color: #ddd;
    }
  }

  .node-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.node-detail {
  border-top: 1px solid #eee;
  max-height: 200px;
  overflow: auto;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: #f5f5f5;
    font-size: 12px;
    font-weight: 600;
  }

  .detail-content {
    padding: 8px 12px;
  }

  .detail-row {
    display: flex;
    font-size: 11px;
    line-height: 1.8;

    .detail-key {
      color: #666;
      width: 60px;
      flex-shrink: 0;
    }

    .detail-value {
      color: #333;
      word-break: break-all;

      &.highlight {
        background: #ffeb3b;
        padding: 0 2px;
      }
    }
  }
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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

  .header-actions {
    display: flex;
    align-items: center;
  }
}

.editor-container {
  flex: 1;
  padding: 0;
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

.editor-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;

  .char-count { flex: 1; }
  .timeout-label { margin-left: 4px; }
}

.result-section {
  width: 300px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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
    color: #999;
    margin-bottom: 8px;
  }

  .result-output {
    margin: 0;
    padding: 8px;
    background: #f8f8f8;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-height: 300px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .result-logs {
    margin-top: 12px;
    padding: 8px;
    background: #1e1e1e;
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;

    .logs-header {
      color: #888;
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
</style>
