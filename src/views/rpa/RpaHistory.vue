<template>
  <div class="rpa-history">
    <div class="history-header">
      <h3>{{ t('rpa.executionHistory') }}</h3>
      <el-button :icon="Refresh" circle @click="loadHistory" :loading="loading" />
    </div>

    <el-table :data="historyList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="deviceId" :label="t('device.deviceId')" width="100" />
      <el-table-column prop="rpaName" :label="t('rpa.flowName')" min-width="120" />
      <el-table-column :label="t('common.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('rpa.progress')" width="120">
        <template #default="{ row }">
          <span>{{ row.currentStep }}/{{ row.totalSteps }}</span>
          <el-progress
            :percentage="getProgress(row)"
            :status="getProgressStatus(row.status)"
            :stroke-width="4"
            style="margin-top: 4px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('rpa.result')" width="100">
        <template #default="{ row }">
          <span class="success-count">✓{{ row.successSteps }}</span>
          <span class="failed-count" v-if="row.failedSteps > 0">✗{{ row.failedSteps }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('rpa.duration')" width="90">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column prop="startedAt" :label="t('common.startTime')" width="160">
        <template #default="{ row }">
          {{ formatTime(row.startedAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="errorMessage" :label="t('common.error')" min-width="150">
        <template #default="{ row }">
          <el-tooltip v-if="row.errorMessage" :content="row.errorMessage" placement="top">
            <span class="error-text">{{ row.errorMessage }}</span>
          </el-tooltip>
          <span v-else class="no-error">-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="history-footer" v-if="historyList.length > 0">
      <span class="total-text">{{ t('common.total') }} {{ historyList.length }} {{ t('common.records') }}</span>
    </div>

    <el-empty v-if="!loading && historyList.length === 0" :description="t('rpa.noHistory')" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Refresh } from '@element-plus/icons-vue'
import { backendApi } from '@/api/backendApi'

interface HistoryItem {
  id: number
  deviceId: number
  rpaId: number
  rpaName: string
  status: 'running' | 'success' | 'failed' | 'cancelled'
  totalSteps: number
  currentStep: number
  currentSubStep: number
  successSteps: number
  failedSteps: number
  errorMessage: string
  startedAt: string
  completedAt: string
  duration: number
}

const { t } = useI18n()
const loading = ref(false)
const historyList = ref<HistoryItem[]>([])

const loadHistory = async () => {
  loading.value = true
  try {
    const data = await backendApi.getRpaHistory(50)
    historyList.value = data || []
  } catch (e) {
    console.error('Failed to load history', e)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    running: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    running: t('rpa.statusRunning'),
    success: t('rpa.statusSuccess'),
    failed: t('rpa.statusFailed'),
    cancelled: t('rpa.statusCancelled')
  }
  return map[status] || status
}

const getProgress = (row: HistoryItem) => {
  if (row.totalSteps === 0) return 0
  return Math.round((row.currentStep / row.totalSteps) * 100)
}

const getProgressStatus = (status: string) => {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'exception'
  return undefined
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '-'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m${secs}s`
}

const formatTime = (time: string) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.rpa-history {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  margin: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.success-count {
  color: #67c23a;
  margin-right: 8px;
}

.failed-count {
  color: #f56c6c;
}

.error-text {
  color: #f56c6c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 200px;
}

.no-error {
  color: #c0c4cc;
}

.history-footer {
  margin-top: 16px;
  text-align: right;

  .total-text {
    color: #909399;
    font-size: 13px;
  }
}
</style>
