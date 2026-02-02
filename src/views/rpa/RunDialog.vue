<template>
  <el-dialog 
    v-model="visible" 
    :title="t('rpa.runShortcut')" 
    width="800px" 
    class="ios-dialog"
  >
    <div class="dialog-header-info">
      <h3>{{ taskName }}</h3>
      <p>{{ t('rpa.selectDevicesMsg') }}</p>
    </div>
    <div class="dialog-toolbar">
       <el-input v-model="deviceSearch" :placeholder="t('rpa.searchDevices')" class="ios-search" />
       <span class="selection-info">{{ selectedDevices.length }} {{ t('rpa.selected') }}</span>
    </div>
    <el-table 
      :data="filteredDevices" 
      height="400" 
      @selection-change="handleSelectionChange" 
      ref="deviceTableRef"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="deviceId" :label="t('rpa.id')" width="120" />
      <el-table-column prop="deviceInfo.brand" :label="t('rpa.brand')" />
      <el-table-column prop="deviceInfo.online" :label="t('rpa.status')">
          <template #default="scope">
              <el-tag :type="scope.row.deviceInfo?.online ? 'success' : 'danger'" size="small" effect="dark" round>
                  {{ scope.row.deviceInfo?.online ? t('rpa.online') : t('rpa.offline') }}
              </el-tag>
          </template>
      </el-table-column>
    </el-table>
    
    <div class="execution-log" v-if="logs.length > 0">
       <div v-for="(log, i) in logs" :key="i" :class="log.type">{{ log.msg }}</div>
    </div>
    
    <template #footer>
      <el-button @click="visible = false">{{ t('rpa.cancel') }}</el-button>
      <el-button 
        type="primary" 
        @click="handleRun" 
        :loading="running" 
        :disabled="running || selectedDevices.length === 0" 
        round
      >
         {{ t('rpa.runShortcut') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  modelValue: boolean;
  taskName: string;
  allDevices: any[];
  running: boolean;
  logs: {type: string, msg: string}[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'run', devices: any[]): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const deviceSearch = ref('');
const selectedDevices = ref<any[]>([]);
const deviceTableRef = ref();

const filteredDevices = computed(() => {
    if (!deviceSearch.value) return props.allDevices;
    const q = deviceSearch.value.toLowerCase();
    return props.allDevices.filter(d => 
        d.deviceId.toString().includes(q) || 
        d.deviceInfo?.brand?.toLowerCase().includes(q)
    );
});

const handleSelectionChange = (selection: any[]) => {
    selectedDevices.value = selection;
};

const handleRun = () => {
    emit('run', selectedDevices.value);
};

// Reset selection when dialog opens
watch(() => props.modelValue, (val) => {
    if (val && deviceTableRef.value) {
        deviceTableRef.value.clearSelection();
        selectedDevices.value = [];
        deviceSearch.value = '';
    }
});
</script>

<style scoped lang="scss">
.dialog-header-info {
  text-align: center;
  margin-bottom: 20px;
  h3 { margin: 0 0 5px 0; font-size: 20px; }
  p { margin: 0; color: #8e8e93; font-size: 14px; }
}

.dialog-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .ios-search { width: 200px; }
  .selection-info { font-size: 13px; color: #8e8e93; }
}

.execution-log {
  margin-top: 15px;
  background: #1c1c1e;
  border-radius: 8px;
  padding: 10px;
  height: 150px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  
  div { margin-bottom: 4px; }
  .info { color: #a1a1aa; }
  .success { color: #34c759; }
  .error { color: #ff3b30; }
}
</style>
