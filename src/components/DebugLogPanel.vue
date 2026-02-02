<template>
  <div v-if="store.isOpen" class="debug-panel">
    <div class="debug-header">
      <div class="header-left">
        <h3>Debug Logs</h3>
        <el-radio-group v-model="filterType" size="small" class="filter-group">
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="ws">WS</el-radio-button>
          <el-radio-button label="api">API</el-radio-button>
        </el-radio-group>
      </div>
      <div class="actions">
        <el-button size="small" @click="store.clearLogs">Clear</el-button>
        <el-button size="small" @click="store.togglePanel">Close</el-button>
      </div>
    </div>
    
    <div class="debug-content">
      <div v-for="log in filteredLogs" :key="log.id" class="log-item" :class="[log.type]">
        <div class="log-summary" @click="log.expanded = !log.expanded">
          <span class="timestamp">{{ log.timestamp }}</span>
          <span class="type-badge" :class="getTypeClass(log.type)">{{ log.type }}</span>
          <span class="method" v-if="log.method">{{ log.method }}</span>
          <span class="summary-text">{{ log.summary }}</span>
          <el-icon class="expand-icon" :class="{ rotated: log.expanded }"><ArrowRight /></el-icon>
        </div>
        
        <div v-if="log.expanded" class="log-details">
            <pre>{{ formatData(log.data) }}</pre>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="debug-trigger" @click="store.togglePanel">
    <el-icon><Monitor /></el-icon> Debug
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebugStore } from '@/stores/debugStore'
import { ArrowRight, Monitor } from '@element-plus/icons-vue'

const store = useDebugStore()
const filterType = ref('all')

const filteredLogs = computed(() => {
  if (filterType.value === 'all') return store.logs
  if (filterType.value === 'ws') return store.logs.filter(l => l.type.startsWith('ws-'))
  if (filterType.value === 'api') return store.logs.filter(l => l.type.startsWith('api-'))
  return store.logs
})

const getTypeClass = (type: string) => {
  if (type.startsWith('ws-')) return 'badge-ws'
  if (type.startsWith('api-')) return 'badge-api'
  return ''
}

const formatData = (data: any) => {
  try {
    return JSON.stringify(data, null, 2)
  } catch (e) {
    return data
  }
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 40vh;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.debug-header {
  padding: 10px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.debug-header h3 {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.log-summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  background: #fff;
}

.log-summary:hover {
  background: #f0f9eb;
}

.timestamp {
  color: #909399;
  margin-right: 10px;
  min-width: 60px;
}

.type-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-right: 10px;
  color: #fff;
  min-width: 60px;
  text-align: center;
  text-transform: uppercase;
}

.badge-ws {
  background-color: #67c23a;
}
.badge-api {
  background-color: #409eff;
}

.log-item.ws-send .type-badge { background-color: #67c23a; } /* Green */
.log-item.ws-recv .type-badge { background-color: #e6a23c; } /* Orange */
.log-item.ws-push .type-badge { background-color: #909399; } /* Gray */

.log-item.api-req .type-badge { background-color: #409eff; } /* Blue */
.log-item.api-res .type-badge { background-color: #f56c6c; } /* Red */


.method {
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
}

.summary-text {
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.expand-icon {
  margin-left: 10px;
  transition: transform 0.2s;
}

.rotated {
  transform: rotate(90deg);
}

.log-details {
  padding: 10px;
  background: #fafafa;
  border-top: 1px dashed #ebeef5;
  overflow-x: auto;
}

.debug-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #409eff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
</style>
