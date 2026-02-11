<template>
  <el-dialog
    v-model="visible"
    :title="$t('s5.title')"
    width="500px"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-form :model="form" label-position="top" v-loading="loading">
      <!-- Status Indicator -->
      <div class="mb-4 flex items-center justify-between bg-gray-50 p-2 rounded">
        <span class="text-sm text-gray-600">WebSocket Status:</span>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
          <span class="text-sm font-medium">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
      </div>

      <el-form-item :label="$t('s5.s5Url')">
        <el-input v-model="form.s5Url" placeholder="socks5://user:pass@host:port" />
      </el-form-item>

      <el-form-item :label="$t('s5.outLine')">
        <el-select v-model="form.nOutSwID" :placeholder="$t('common.choose')" style="width: 100%">
          <el-option
            v-for="line in outLines"
            :key="line.nSwID"
            :label="line.szName"
            :value="line.nSwID"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="saveConfig" :loading="saving" :disabled="!isConnected">
        {{ $t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUnifiedWebSocket } from '@/composables/useUnifiedWebSocket'

const props = defineProps<{
  modelValue: boolean
  deviceId: number
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const saving = ref(false)
const outLines = ref<any[]>([])

const { isConnected, send, onMessage } = useUnifiedWebSocket()

const form = reactive({
  s5Url: '',
  nOutSwID: 0
})

// Listen for unified messages
onMessage((res) => {
  console.log('[S5ConfigDialog] Received message:', res)
  if (res.code !== 200) {
    if (res.type === 'setSocket5') {
      ElMessage.error(res.msg || 'Operation failed')
      saving.value = false
    }
    return
  }

  switch (res.type) {
    case 'getS5outLine':
      if (res.data) {
        const lines = Array.isArray(res.data) ? res.data : (res.data.records || [])
        console.log('[S5ConfigDialog] Updating outLines:', lines)
        outLines.value = lines
      }
      loading.value = false
      break
      
    case 'setSocket5':
      ElMessage.success('S5 Configured Successfully')
      saving.value = false
      visible.value = false
      emit('success')
      break
  }
})

const fetchOutLines = () => {
  loading.value = true
  outLines.value = [] // Clear previous options
  send('getS5outLine', { deviceId: props.deviceId })
  
  // Timeout protection
  setTimeout(() => {
    if (loading.value) {
      console.warn('[S5ConfigDialog] Fetch timeout')
      loading.value = false
    }
  }, 5000)
}

const saveConfig = () => {
  if (!form.s5Url) {
    ElMessage.warning('Please enter S5 URL')
    return
  }
  
  saving.value = true
  send('setSocket5', {
    deviceId: props.deviceId,
    s5Url: form.s5Url,
    nOutSwID: form.nOutSwID
  })
}

const handleOpen = () => {
  // Reset form
  form.s5Url = ''
  form.nOutSwID = 0
  
  if (isConnected.value) {
    fetchOutLines()
  } else {
    ElMessage.warning('WebSocket not connected. Please check service status.')
  }
}

const handleClose = () => {
  // Cleanup if needed
}

</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
