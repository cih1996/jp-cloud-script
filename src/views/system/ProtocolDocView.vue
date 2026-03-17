<template>
  <div class="protocol-doc">
    <el-card shadow="never">
      <template #header>
        <div class="doc-header">
          <h2>设备 WebSocket 通讯协议手册</h2>
          <el-tag type="info">端口: 1003</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="协议概述" name="overview">
          <div class="doc-section">
            <h3>连接地址</h3>
            <el-input :value="wsUrl" readonly>
              <template #append>
                <el-button @click="copyText(wsUrl)">复制</el-button>
              </template>
            </el-input>

            <h3>协议特点</h3>
            <ul>
              <li>二进制协议，16 字节固定头部</li>
              <li>支持 JSON / 文本 / 二进制数据格式</li>
              <li>心跳机制：30 秒间隔，90 秒超时</li>
              <li>初始化超时：3 秒内必须发送 INIT 包</li>
            </ul>

            <h3>数据包结构</h3>
            <div class="code-block">
              <pre>
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  MsgType    │ DataFormat  │  DeviceID   │   SeqNo     │
│  (1 byte)   │  (1 byte)   │  (4 bytes)  │  (4 bytes)  │
├─────────────┴─────────────┴─────────────┴─────────────┤
│                    DataLen (4 bytes)                  │
├───────────────────────────────────────────────────────┤
│                   Reserved (2 bytes)                  │
├───────────────────────────────────────────────────────┤
│                   Payload (变长)                      │
└───────────────────────────────────────────────────────┘
              </pre>
            </div>
            <p class="note">所有多字节整数使用大端序 (Big-Endian)</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="消息类型" name="messages">
          <div class="doc-section">
            <h3>客户端 → 服务端</h3>
            <el-table :data="clientMessages" border stripe>
              <el-table-column prop="type" label="类型码" width="100" />
              <el-table-column prop="name" label="名称" width="150" />
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h3>服务端 → 客户端</h3>
            <el-table :data="serverMessages" border stripe>
              <el-table-column prop="type" label="类型码" width="100" />
              <el-table-column prop="name" label="名称" width="150" />
              <el-table-column prop="desc" label="说明" />
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="数据格式" name="formats">
          <div class="doc-section">
            <h3>DataFormat 字段</h3>
            <el-table :data="dataFormats" border stripe>
              <el-table-column prop="value" label="值" width="100" />
              <el-table-column prop="name" label="名称" width="150" />
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h3>DeviceID 生成规则</h3>
            <p>DeviceID 由设备序列号 (serialno) 通过 CRC32 哈希生成：</p>
            <div class="code-block">
              <pre>deviceID = CRC32(serialno)</pre>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="初始化流程" name="init">
          <div class="doc-section">
            <h3>连接流程</h3>
            <ol>
              <li>客户端建立 WebSocket 连接</li>
              <li>3 秒内发送 INIT 包 (0x02)</li>
              <li>服务端验证后返回 INIT_ACK (0x22)</li>
              <li>进入正常通讯状态</li>
            </ol>

            <h3>INIT 包 Payload (JSON)</h3>
            <div class="code-block">
              <pre>{{ initPayloadExample }}</pre>
            </div>

            <h3>INIT_ACK 包 Payload (JSON)</h3>
            <div class="code-block">
              <pre>{{ initAckExample }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="心跳机制" name="heartbeat">
          <div class="doc-section">
            <h3>心跳参数</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="心跳间隔">30 秒</el-descriptions-item>
              <el-descriptions-item label="超时时间">90 秒</el-descriptions-item>
              <el-descriptions-item label="检查间隔">10 秒</el-descriptions-item>
            </el-descriptions>

            <h3>心跳流程</h3>
            <ol>
              <li>客户端每 30 秒发送 HEARTBEAT (0x01)</li>
              <li>服务端回复 HEARTBEAT_ACK (0x21)</li>
              <li>超过 90 秒无活动，服务端断开连接</li>
            </ol>

            <h3>心跳包格式</h3>
            <p>心跳包无 Payload，DataLen = 0</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="任务下发" name="task">
          <div class="doc-section">
            <h3>TASK_PUSH (0x23) Payload</h3>
            <div class="code-block">
              <pre>{{ taskPushExample }}</pre>
            </div>

            <h3>TASK_RESULT (0x13) Payload</h3>
            <div class="code-block">
              <pre>{{ taskResultExample }}</pre>
            </div>

            <h3>COMMAND (0x24) Payload</h3>
            <div class="code-block">
              <pre>{{ commandExample }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="API 接口" name="api">
          <div class="doc-section">
            <h3>REST API 端点</h3>
            <el-table :data="apiEndpoints" border stripe>
              <el-table-column prop="method" label="方法" width="80" />
              <el-table-column prop="path" label="路径" width="280" />
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h3>获取设备列表示例</h3>
            <div class="code-block">
              <pre>GET /api/devicews/devices

Response:
{
  "code": 200,
  "data": [
    {
      "deviceId": 305419896,
      "serialno": "ABC123",
      "state": "idle",
      "brand": "Samsung",
      "model": "Galaxy S21",
      "connectedAt": 1710000000000,
      "lastSeen": 1710000030000
    }
  ]
}</pre>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('overview')

const wsUrl = computed(() => `ws://${window.location.hostname}:1003/ws/device`)

const clientMessages = [
  { type: '0x01', name: 'HEARTBEAT', desc: '心跳包，无 Payload' },
  { type: '0x02', name: 'INIT', desc: '初始化包，包含设备信息 JSON' },
  { type: '0x10', name: 'STATUS_REPORT', desc: '状态上报' },
  { type: '0x11', name: 'LOG_REPORT', desc: '日志上报' },
  { type: '0x12', name: 'PROGRESS_REPORT', desc: '进度上报' },
  { type: '0x13', name: 'TASK_RESULT', desc: '任务执行结果' },
  { type: '0x14', name: 'SCRIPT_PULL', desc: '请求拉取脚本' },
  { type: '0x15', name: 'RESOURCE_PULL', desc: '请求拉取资源' },
  { type: '0x16', name: 'SCREENSHOT_DATA', desc: '截图数据上传' },
]

const serverMessages = [
  { type: '0x21', name: 'HEARTBEAT_ACK', desc: '心跳响应' },
  { type: '0x22', name: 'INIT_ACK', desc: '初始化响应，包含服务端配置' },
  { type: '0x23', name: 'TASK_PUSH', desc: '下发任务' },
  { type: '0x24', name: 'COMMAND', desc: '下发命令' },
  { type: '0x25', name: 'TASK_CANCEL', desc: '取消任务' },
  { type: '0x26', name: 'SCRIPT_DATA', desc: '脚本数据' },
  { type: '0x27', name: 'RESOURCE_DATA', desc: '资源数据' },
  { type: '0x28', name: 'RESOURCE_PUSH', desc: '主动推送资源' },
  { type: '0x29', name: 'CONFIG_UPDATE', desc: '配置更新' },
  { type: '0x2A', name: 'DEBUG_EXEC', desc: '调试执行' },
]

const dataFormats = [
  { value: '0x00', name: 'NONE', desc: '无数据' },
  { value: '0x01', name: 'JSON', desc: 'JSON 格式' },
  { value: '0x02', name: 'TEXT', desc: '纯文本' },
  { value: '0x03', name: 'BINARY', desc: '二进制数据' },
]

const apiEndpoints = [
  { method: 'GET', path: '/api/devicews/devices', desc: '获取所有在线设备' },
  { method: 'GET', path: '/api/devicews/devices/:deviceId', desc: '获取单个设备信息' },
  { method: 'GET', path: '/api/devicews/stats', desc: '获取统计信息' },
  { method: 'POST', path: '/api/devicews/devices/:deviceId/task', desc: '向设备发送任务' },
  { method: 'POST', path: '/api/devicews/devices/:deviceId/command', desc: '向设备发送命令' },
  { method: 'POST', path: '/api/devicews/devices/:deviceId/debug', desc: '向设备发送调试执行' },
  { method: 'POST', path: '/api/devicews/broadcast/task', desc: '广播任务到所有设备' },
  { method: 'POST', path: '/api/devicews/broadcast/command', desc: '广播命令到所有设备' },
  { method: 'DELETE', path: '/api/devicews/devices/:deviceId', desc: '断开设备连接' },
]

const initPayloadExample = `{
  "serialno": "ABC123DEF456",
  "version": "1.0.0",
  "sdkVersion": "2.0.0",
  "screenWidth": 1080,
  "screenHeight": 2400,
  "brand": "Samsung",
  "model": "Galaxy S21",
  "androidVersion": "12",
  "state": "idle"
}`

const initAckExample = `{
  "success": true,
  "serverTime": 1710000000000,
  "config": {
    "heartbeatInterval": 30000,
    "taskTimeout": 300000
  }
}`

const taskPushExample = `{
  "taskId": "task_001",
  "scriptHash": "abc123...",
  "params": {
    "key1": "value1"
  },
  "priority": 1,
  "timeout": 60000
}`

const taskResultExample = `{
  "taskId": "task_001",
  "success": true,
  "duration": 5000,
  "result": { ... },
  "error": null
}`

const commandExample = `{
  "cmd": "screenshot",
  "params": {
    "quality": 80,
    "scale": 0.5
  }
}`

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped lang="scss">
.protocol-doc {
  padding: 16px;
  height: 100%;
  background-color: #f3f4f6;
  overflow: auto;
}

.doc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.doc-section {
  h3 {
    margin: 24px 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;

    &:first-child {
      margin-top: 0;
    }
  }

  ul, ol {
    padding-left: 20px;
    line-height: 1.8;
    color: #4b5563;
  }

  p {
    color: #4b5563;
    line-height: 1.6;
  }

  .note {
    color: #6b7280;
    font-size: 13px;
    font-style: italic;
  }
}

.code-block {
  background: #1f2937;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    color: #e5e7eb;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre;
  }
}

:deep(.el-table) {
  margin-bottom: 16px;
}

:deep(.el-descriptions) {
  margin-bottom: 16px;
}
</style>
