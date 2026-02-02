<template>
  <div v-if="task" class="editor-container">
    <div class="editor-header">
      <div class="header-left">
        <div class="editor-icon" :style="{ background: getTaskColor(task.id) }">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="title-section">
          <input 
            v-if="isEditing" 
            v-model="editingForm.name" 
            class="ios-title-input" 
            :placeholder="t('rpa.shortcutName')"
          />
          <h1 v-else>{{ task.name }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <div class="test-device-selector" v-if="isEditing">
           <el-select 
              v-model="currentTestDeviceId" 
              :placeholder="t('rpa.testDevice')" 
              filterable 
              size="small" 
              style="width: 160px; margin-right: 12px"
              class="ios-select-device"
           >
              <el-option 
                  v-for="d in allDevices" 
                  :key="d.deviceId" 
                  :label="`${d.deviceId}${d.note ? ' - ' + d.note : ''}`" 
                  :value="d.deviceId"
              >
                 <span style="float: left">{{ d.deviceId }}</span>
                 <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 10px">{{ d.deviceInfo?.brand }}</span>
              </el-option>
           </el-select>
        </div>

        <template v-if="!isEditing">
           <el-button class="ios-icon-btn" circle @click="openRunDialog">
              <el-icon><VideoPlay /></el-icon>
           </el-button>
           <el-button class="ios-nav-btn" link @click="startEditing">{{ t('rpa.edit') }}</el-button>
        </template>
        <template v-else>
          <el-button class="ios-nav-btn" link @click="cancelEdit">{{ t('rpa.cancel') }}</el-button>
          <el-button class="ios-nav-btn" link @click="runQuickTest">{{ t('rpa.test') }}</el-button>
          <el-button class="ios-nav-btn done" link @click="saveTask">{{ t('rpa.done') }}</el-button>
        </template>
      </div>
    </div>

    <!-- Steps Flow -->
    <el-scrollbar class="editor-body">
      <div class="steps-flow" :class="{ 'editing-mode': isEditing }">
        <div 
          v-for="(step, index) in displaySteps" 
          :key="step.id" 
          class="action-block"
        >
          <div class="action-header" :style="{ borderLeftColor: getStepStyle(step.type).color }">
            <!-- Status Indicator Overlay -->
            <div class="status-indicator" v-if="stepExecutionState[step.id]" :class="stepExecutionState[step.id]?.status">
                <el-icon v-if="stepExecutionState[step.id]?.status === 'running'" class="is-loading"><Loading /></el-icon>
                <el-icon v-if="stepExecutionState[step.id]?.status === 'success'"><Check /></el-icon>
                <el-icon v-if="stepExecutionState[step.id]?.status === 'error'"><Close /></el-icon>
            </div>

            <div class="action-icon" :style="{ background: getStepStyle(step.type).bg, color: getStepStyle(step.type).color }">
              <component :is="getStepStyle(step.type).icon" />
            </div>
            <div class="action-title">
              <span class="action-type">{{ formatStepType(step.type, t) }}</span>
              <input v-if="isEditing" v-model="step.name" class="action-name-input" :placeholder="t('rpa.actionName')" />
              <span v-else class="action-name-display">{{ step.name }}</span>
            </div>
            <div class="action-controls" v-if="isEditing">
              <el-button text circle size="small" @click="moveStep(index, -1)" :disabled="index === 0">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button text circle size="small" @click="moveStep(index, 1)" :disabled="index === displaySteps.length - 1">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button text circle size="small" type="danger" @click="removeStep(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Execution Result View -->
          <div class="execution-result" v-if="stepExecutionState[step.id] && stepExecutionState[step.id]?.status !== 'pending' && stepExecutionState[step.id]?.status !== 'running'">
              <div v-if="stepExecutionState[step.id]?.error" class="result-error">
                  {{ t('rpa.error') }}: {{ stepExecutionState[step.id]?.error }}
              </div>
              <div v-else class="result-success">
                  <span v-if="stepExecutionState[step.id]?.outputVar" class="var-badge">{{ stepExecutionState[step.id]?.outputVar }} = </span>
                  <span class="result-value">{{ typeof stepExecutionState[step.id]?.result === 'object' ? JSON.stringify(stepExecutionState[step.id]?.result).slice(0, 50) + '...' : stepExecutionState[step.id]?.result }}</span>
              </div>
          </div>

          <!-- Step Content (Inputs) -->
          <div class="action-content" v-if="isEditing || true">
             <!-- Shell -->
             <template v-if="step.type === 'shell'">
               <div class="ios-field">
                 <label>{{ t('rpa.command') }}</label>
                 <el-input type="textarea" v-model="step.params.command" :rows="2" :placeholder="t('rpa.scriptPlaceholder')" resize="none" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                  <label>{{ t('rpa.outputVar') }}</label>
                  <el-input v-model="step.params.outputVar" :placeholder="t('rpa.outputVarPlaceholder')" :readonly="!isEditing" />
               </div>
             </template>

             <!-- Download URL -->
             <template v-if="step.type === 'download_url'">
               <div class="ios-field">
                 <label>{{ t('rpa.url') }}</label>
                 <el-input v-model="step.params.url" placeholder="https://..." :readonly="!isEditing" />
               </div>
               <div class="field-row">
                 <div class="ios-field half">
                   <label>{{ t('rpa.fileName') }}</label>
                   <el-input v-model="step.params.fileName" placeholder="app.apk" :readonly="!isEditing" />
                 </div>
                 <div class="ios-field half">
                   <label>{{ t('rpa.sha256') }}</label>
                   <el-input v-model="step.params.hash" :placeholder="t('rpa.optional')" :readonly="!isEditing" />
                 </div>
               </div>
             </template>

             <!-- Download Cloud -->
             <template v-if="step.type === 'download_cloud'">
               <div class="ios-field has-button">
                  <label>{{ t('rpa.cloudFile') }}</label>
                  <div class="input-wrapper">
                    <el-input v-model="step.params.fileName" readonly :placeholder="t('rpa.selectFile')" />
                    <el-button v-if="isEditing" type="primary" link @click="openCloudSelector(index)">{{ t('rpa.choose') }}</el-button>
                  </div>
               </div>
             </template>

             <!-- Change OS -->
             <template v-if="step.type === 'change_os'">
                <div class="field-row">
                  <div class="ios-field half">
                    <label>{{ t('rpa.bs') }}</label>
                    <el-select v-model="step.params.bs" allow-create filterable default-first-option :disabled="!isEditing">
                       <el-option label="WIFI" value="wifi" />
                       <el-option label="Cellular" value="cellular" />
                    </el-select>
                  </div>
                  <div class="ios-field half">
                    <label>{{ t('rpa.category') }}</label>
                    <el-input v-model="step.params.category" placeholder="491" :readonly="!isEditing" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="ios-field half"><label>{{ t('rpa.version') }}</label><el-input v-model="step.params.version" :readonly="!isEditing" /></div>
                  <div class="ios-field half"><label>{{ t('rpa.country') }}</label><el-input v-model="step.params.country" :readonly="!isEditing" /></div>
                </div>
                <el-collapse class="ios-collapse">
                  <el-collapse-item :title="t('rpa.advancedSettings')">
                     <div class="field-grid">
                       <div class="ios-field"><label>{{ t('rpa.language') }}</label><el-input v-model="step.params.language" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>{{ t('rpa.timezone') }}</label><el-input v-model="step.params.timezone" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>{{ t('rpa.operator') }}</label><el-input v-model="step.params.operator" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>{{ t('rpa.opName') }}</label><el-input v-model="step.params.operatorName" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>{{ t('rpa.mcc') }}</label><el-input v-model="step.params.mcc" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>{{ t('rpa.mnc') }}</label><el-input v-model="step.params.mnc" :readonly="!isEditing" /></div>
                     </div>
                     <div class="ios-field"><label>{{ t('rpa.customJson') }}</label><el-input v-model="step.params.customParams" placeholder="{}" :readonly="!isEditing" /></div>
                  </el-collapse-item>
                </el-collapse>
                <div class="ios-field">
                   <label>{{ t('rpa.outputVar') }}</label>
                   <el-input v-model="step.params.outputVar" :placeholder="t('rpa.outputVarPlaceholder')" :readonly="!isEditing" />
                </div>
             </template>

             <!-- HTTP Request -->
             <template v-if="step.type === 'http_request'">
               <div class="field-row">
                 <div class="ios-field quarter">
                   <label>{{ t('rpa.method') }}</label>
                   <el-select v-model="step.params.method" :disabled="!isEditing"><el-option value="GET" /><el-option value="POST" /></el-select>
                 </div>
                 <div class="ios-field three-quarter">
                   <label>{{ t('rpa.url') }}</label>
                   <el-input v-model="step.params.url" :readonly="!isEditing" />
                 </div>
               </div>
               <div class="ios-field"><label>{{ t('rpa.headers') }}</label><el-input v-model="step.params.headers" placeholder="{}" :readonly="!isEditing" /></div>
               <div class="ios-field" v-if="step.params.method === 'POST'"><label>{{ t('rpa.body') }}</label><el-input type="textarea" v-model="step.params.body" :rows="2" :readonly="!isEditing" /></div>
               <div class="field-row">
                 <div class="ios-field half"><label>{{ t('rpa.extract') }}</label><el-input v-model="step.params.extractPath" placeholder="path.to.val" :readonly="!isEditing" /></div>
                 <div class="ios-field half"><label>{{ t('rpa.saveAs') }}</label><el-input v-model="step.params.outputVar" placeholder="varName" :readonly="!isEditing" /></div>
               </div>
             </template>

             <!-- Custom JS -->
             <template v-if="step.type === 'custom_js'">
               <div class="ios-field code-field">
                 <label>{{ t('rpa.script') }}</label>
                 <el-input type="textarea" v-model="step.params.code" :rows="6" class="code-font" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                  <label>{{ t('rpa.outputVar') }}</label>
                  <el-input v-model="step.params.outputVar" :placeholder="t('rpa.outputVarPlaceholder')" :readonly="!isEditing" />
               </div>
             </template>
          </div>
        </div>

        <!-- Add Action Button -->
        <div class="add-action-wrapper" v-if="isEditing">
          <div class="add-action-search">
             <button class="ios-search-btn" @click="actionDrawerVisible = true">
               <el-icon class="mr-2"><Plus /></el-icon> {{ t('rpa.addAction') }}
             </button>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <ActionDrawer v-model="actionDrawerVisible" @add-step="addStep" />
    <CloudFileSelector 
        v-model="cloudSelectorVisible" 
        :cloud-files="cloudFiles" 
        :loading="cloudLoading" 
        @select="handleCloudFileSelect" 
    />
    <RunDialog 
        v-model="runDialogVisible" 
        :task-name="task.name" 
        :all-devices="allDevices"
        :running="running"
        :logs="executionLogs"
        @run="handleRun"
    />
  </div>
  <div v-else class="empty-state-ios">
      <div class="empty-icon"><el-icon><VideoPlay /></el-icon></div>
      <h3>{{ t('rpa.noShortcutSelected') }}</h3>
      <p>{{ t('rpa.noShortcutMsg') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRpaStore, type RpaTask, type RpaStep, type StepType } from '@/stores/rpaStore';
import { useSdkStore } from '@/stores/sdkStore';
import { useRpaExecution } from '@/composables/useRpaExecution';
import { getStepStyle, getTaskColor, formatStepType } from '@/utils/rpaHelpers';
import { 
  Monitor, VideoPlay, ArrowUp, ArrowDown, Delete, Loading, Check, Close, Plus
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ActionDrawer from './ActionDrawer.vue';
import CloudFileSelector from './CloudFileSelector.vue';
import RunDialog from './RunDialog.vue';
import type { ListRes } from '@sdk/index';

const props = defineProps<{
  allDevices: any[];
}>();

const { t } = useI18n();
const rpaStore = useRpaStore();
const sdkStore = useSdkStore();
const { running, executionLogs, stepExecutionState, executeTask } = useRpaExecution();

const isEditing = ref(false);
const editingForm = ref<RpaTask>({} as RpaTask);
const currentTestDeviceId = ref<number | null>(null);

const actionDrawerVisible = ref(false);

const cloudSelectorVisible = ref(false);
const cloudFiles = ref<ListRes[]>([]);
const cloudLoading = ref(false);
const currentStepIndexForCloud = ref(-1);

const runDialogVisible = ref(false);

const task = computed(() => rpaStore.currentTask);
const displaySteps = computed(() => isEditing.value ? editingForm.value.steps : task.value?.steps || []);

// Edit Logic
const startEditing = () => {
    if (task.value) {
        editingForm.value = JSON.parse(JSON.stringify(task.value));
        isEditing.value = true;
    }
};

const cancelEdit = () => {
    isEditing.value = false;
};

const saveTask = () => {
    if (!editingForm.value.name) {
        ElMessage.warning(t('rpa.messages.taskNameRequired'));
        return;
    }
    rpaStore.updateTask(editingForm.value);
    isEditing.value = false;
    ElMessage.success(t('common.success'));
};

// Step Logic
const addStep = (type: string) => {
    const newStep: RpaStep = {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        type: type as StepType,
        name: formatStepType(type, t),
        params: {}
    };
    
    // Init params
    if (type === 'shell') newStep.params = { command: '' };
    if (type === 'download_url') newStep.params = { url: '', fileName: '', hash: '' };
    if (type === 'download_cloud') newStep.params = { fileName: '', fileId: 0, hash: '' };
    if (type === 'change_os') newStep.params = { 
        bs: 'wifi', category: '', version: '', country: 'us',
        language: '', timezone: '', operator: '', operatorName: '',
        mcc: '', mnc: '', msisdn: '', smsc: '', customParams: ''
    };
    if (type === 'http_request') newStep.params = { method: 'GET', url: '', headers: '', body: '', extractPath: '', outputVar: '' };
    if (type === 'custom_js') newStep.params = { code: '// Use context.variables.lastResult for previous output\n// context.variables.myVar = "value";\nreturn "done";' };

    editingForm.value.steps.push(newStep);
};

const removeStep = (index: number) => {
    editingForm.value.steps.splice(index, 1);
};

const moveStep = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < editingForm.value.steps.length) {
        const temp = editingForm.value.steps[index]!;
        editingForm.value.steps[index] = editingForm.value.steps[newIndex]!;
        editingForm.value.steps[newIndex] = temp;
    }
};

// Cloud Logic
const openCloudSelector = async (stepIndex: number) => {
  if (!sdkStore.sdk) {
      ElMessage.warning(t('rpa.messages.sdkNotReady'));
      return;
  }
  currentStepIndexForCloud.value = stepIndex;
  cloudSelectorVisible.value = true;
  cloudLoading.value = true;
  try {
      const res = await sdkStore.sdk.cloudCtl.list({});
      cloudFiles.value = (res || []);
  } catch (e) {
      ElMessage.error(t('rpa.messages.loadCloudFilesFailed'));
  } finally {
      cloudLoading.value = false;
  }
};

const handleCloudFileSelect = (file: ListRes) => {
    if (currentStepIndexForCloud.value !== -1) {
        const step = editingForm.value.steps[currentStepIndexForCloud.value];
        if (step && step.type === 'download_cloud') {
            step.params.fileName = file.fileName;
            step.params.fileId = file.fileId;
            step.params.hash = file.hash;
        }
        cloudSelectorVisible.value = false;
        currentStepIndexForCloud.value = -1;
    }
};

// Execution Logic
const openRunDialog = () => {
    runDialogVisible.value = true;
};

const handleRun = async (devices: any[]) => {
    if (task.value) {
        await executeTask(task.value, devices);
    }
};

const runQuickTest = async () => {
    if (!currentTestDeviceId.value) {
        ElMessage.warning(t('rpa.selectTestDevice'));
        return;
    }
    const device = props.allDevices.find(d => d.deviceId === currentTestDeviceId.value);
    if (!device) {
        ElMessage.warning(t('rpa.messages.testDeviceNotFound'));
        return;
    }
    
    // Use editing form for quick test
    await executeTask(editingForm.value, [device]);
};

// Watch for task change to reset editing mode
watch(() => task.value?.id, () => {
    isEditing.value = false;
});
</script>

<style scoped lang="scss">
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 24px 40px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e5ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 20;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .editor-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .title-section {
      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .ios-title-input {
        font-size: 28px;
        font-weight: 700;
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        color: #000;
        &::placeholder { color: #c7c7cc; }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .ios-select-device {
      :deep(.el-input__wrapper) {
        background-color: rgba(118, 118, 128, 0.12) !important;
        border-radius: 8px;
        box-shadow: none !important;
        
        &.is-focus {
            background-color: rgba(118, 118, 128, 0.2) !important;
        }
      }
    }
    
    .ios-icon-btn {
       font-size: 20px;
       border: none;
       background: rgba(118, 118, 128, 0.12);
       color: #007aff;
       width: 40px;
       height: 40px;
       
       &:hover {
         background: rgba(118, 118, 128, 0.2);
       }
    }

    .ios-nav-btn {
      font-size: 17px;
      font-weight: 400;
      color: #007aff;
      
      &.done {
        font-weight: 600;
      }
    }
  }
}

.editor-body {
  flex: 1;
  background-color: #f2f2f7;
}

.steps-flow {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 100px;
  
  &.editing-mode {
    .action-block {
      border: 1px dashed #d1d1d6;
      box-shadow: none;
      
      &:hover {
        border-color: #007aff;
      }
    }
  }
}

.action-block {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.2s;
  
  .action-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-left: 6px solid transparent;
    background: #fff;
    position: relative;
    
    .status-indicator {
        position: absolute;
        left: -20px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.running { color: #007aff; }
        &.success { color: #34c759; }
        &.error { color: #ff3b30; }
        
        .is-loading { animation: rotate 1s linear infinite; }
    }
    
    .action-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-right: 16px;
    }
    
    .action-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .action-type {
        font-size: 12px;
        text-transform: uppercase;
        color: #8e8e93;
        font-weight: 600;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      
      .action-name-display {
        font-size: 17px;
        font-weight: 600;
        color: #000;
      }
      
      .action-name-input {
        font-size: 17px;
        font-weight: 600;
        border: none;
        outline: none;
        width: 100%;
        padding: 0;
        margin: 0;
        &::placeholder { color: #c7c7cc; }
      }
    }
    
    .action-controls {
       display: flex;
       gap: 4px;
    }
  }
  
  .action-content {
    padding: 0 20px 20px 20px;
    animation: slideDown 0.3s;
    
    .ios-field {
      margin-bottom: 16px;
      
      label {
        display: block;
        font-size: 13px;
        color: #8e8e93;
        margin-bottom: 6px;
        font-weight: 500;
      }
      
      :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
        background-color: #f2f2f7;
        border-radius: 10px;
        box-shadow: none !important;
        padding: 8px 12px;
        
        &.is-focus {
            background-color: #e5e5ea;
        }
      }
      
      &.has-button {
        .input-wrapper {
          display: flex;
          gap: 10px;
        }
      }
      
      &.code-field {
        :deep(.el-textarea__inner) {
          font-family: monospace;
          font-size: 13px;
          line-height: 1.4;
          background-color: #1c1c1e;
          color: #fff;
        }
      }
    }
    
    .field-row {
      display: flex;
      gap: 16px;
      .half { flex: 1; }
      .quarter { flex: 1; }
      .three-quarter { flex: 3; }
    }
    
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }
}

.add-action-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  .ios-search-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,122,255,0.3);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.execution-result {
  background: #1c1c1e;
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-family: monospace;
  font-size: 13px;
  
  .result-error { color: #ff453a; }
  .result-success { color: #32d74b; display: flex; gap: 8px; }
  .var-badge { color: #0a84ff; font-weight: bold; }
  .result-value { color: #fff; }
}

.empty-state-ios {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    color: #d1d1d6;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #000;
  }
  
  p {
    font-size: 15px;
    max-width: 300px;
    text-align: center;
    line-height: 1.4;
  }
}

@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>
