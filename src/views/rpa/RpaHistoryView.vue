<template>
  <div class="rpa-history">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="执行状态" clearable size="small" style="width: 120px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="failed" />
        <el-option label="运行中" value="running" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-input v-model="filterDeviceId" placeholder="设备ID" clearable size="small" style="width: 120px" />
      <el-button type="primary" size="small" @click="fetchHistory" :loading="loading">查询</el-button>
      <el-button size="small" @click="resetFilter">重置</el-button>
    </div>

    <!-- 记录列表 -->
    <el-table :data="historyList" v-loading="loading" stripe size="small" @row-click="toggleDetail"
      highlight-current-row class="history-table" :row-class-name="rowClassName">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="deviceId" label="设备ID" width="80" />
      <el-table-column prop="rpaName" label="流程名称" min-width="140" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="100">
        <template #default="{ row }">
          <span v-if="row.status === 'running'">{{ row.currentStep }}/{{ row.totalSteps }}</span>
          <span v-else>{{ row.successSteps + row.failedSteps }}/{{ row.totalSteps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="耗时" width="90">
        <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
      </el-table-column>
      <el-table-column label="开始时间" width="160">
        <template #default="{ row }">{{ formatTime(row.startedAt) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" width="160">
        <template #default="{ row }">{{ row.completedAt ? formatTime(row.completedAt) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="errorMessage" label="错误信息" min-width="160" show-overflow-tooltip />
    </el-table>

    <!-- 步骤明细抽屉 -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="520px" direction="rtl">
      <div v-if="detailLoading" v-loading="true" style="height: 200px"></div>
      <div v-else-if="stepList.length === 0" class="empty-steps">暂无步骤明细</div>
      <el-timeline v-else>
        <el-timeline-item v-for="step in stepList" :key="step.id"
          :type="timelineType(step.status)" :hollow="step.status === 'running'">
          <div class="step-card">
            <div class="step-header">
              <span class="step-name">{{ step.stepIndex + 1 }}. {{ step.stepName }}</span>
              <el-tag :type="statusType(step.status)" size="small" effect="plain">{{ statusText(step.status) }}</el-tag>
            </div>
            <div class="step-meta">
              <span class="step-type">{{ step.stepType }}</span>
              <span class="step-duration" v-if="step.duration > 0">{{ formatDurationMs(step.duration) }}</span>
              <span class="step-time">{{ formatTime(step.startedAt) }}</span>
            </div>
            <div v-if="step.errorMessage" class="step-error">{{ step.errorMessage }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { backendApi } from '@/api/backendApi'

interface HistoryItem {
  id: number
  deviceId: number
  rpaId: number
  rpaName: string
  status: string
  totalSteps: number
  currentStep: number
  currentSubStep: number
  successSteps: number
  failedSteps: number
  errorMessage: string
  startedAt: string
  completedAt: string | null
  duration: number
}

interface StepItem {
  id: number
  historyId: number
  deviceId: number
  stepIndex: number
  stepName: string
  stepType: string
  status: string
  errorMessage: string
  startedAt: string
  completedAt: string | null
  duration: number
}

const loading = ref(false)
const historyList = ref<HistoryItem[]>([])
const filterStatus = ref('')
const filterDeviceId = ref('')

const drawerVisible = ref(false)
const drawerTitle = ref('')
const detailLoading = ref(false)
const stepList = ref<StepItem[]>([])
const selectedId = ref<number | null>(null)

const fetchHistory = async () => {
  loading.value = true
  try {
    const params: any = { limit: 100 }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterDeviceId.value) params.deviceId = Number(filterDeviceId.value)
    historyList.value = (await backendApi.getRpaHistoryList(params)) || []
  } catch (e) {
    console.error('获取执行历史失败', e)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterStatus.value = ''
  filterDeviceId.value = ''
  fetchHistory()
}

const toggleDetail = async (row: HistoryItem) => {
  selectedId.value = row.id
  drawerTitle.value = `#${row.id} ${row.rpaName} - 设备 ${row.deviceId}`
  drawerVisible.value = true
  detailLoading.value = true
  try {
    const result = await backendApi.getRpaHistoryDetail(row.id)
    stepList.value = result.steps || []
  } catch (e) {
    console.error('获取步骤明细失败', e)
    stepList.value = []
  } finally {
    detailLoading.value = false
  }
}

const statusType = (status: string) => {
  const map: Record<string, string> = { success: 'success', failed: 'danger', running: 'primary', cancelled: 'info' }
  return map[status] || 'info'
}

const timelineType = (status: string) => {
  const map: Record<string, string> = { success: 'success', failed: 'danger', running: 'primary', cancelled: 'info' }
  return map[status] || 'info'
}

const statusText = (status: string) => {
  const map: Record<string, string> = { success: '成功', failed: '失败', running: '运行中', cancelled: '已取消' }
  return map[status] || status
}

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '-'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m${s}s` : `${m}m`
}

const formatDurationMs = (ms: number) => {
  if (!ms || ms <= 0) return ''
  if (ms < 1000) return `${ms}ms`
  return formatDuration(Math.round(ms / 1000))
}

const formatTime = (t: string) => {
  if (!t) return '-'
  const d = new Date(t)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const rowClassName = ({ row }: { row: HistoryItem }) => {
  return row.id === selectedId.value ? 'selected-row' : ''
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.rpa-history {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.history-table {
  flex: 1;
  overflow: auto;
}

:deep(.selected-row) {
  background-color: #ecf5ff !important;
}

.empty-steps {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.step-card {
  padding: 4px 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.step-name {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
}

.step-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.step-duration {
  color: #606266;
  font-weight: 500;
}

.step-error {
  margin-top: 4px;
  padding: 6px 10px;
  background: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;
  word-break: break-all;
}
</style>
