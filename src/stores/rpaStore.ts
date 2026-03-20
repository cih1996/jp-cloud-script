import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { backendApi } from '@/api/backendApi';

// 步骤类型（后端定义的模块化步骤）
export type StepType =
  // 系统操作
  | 'change_os_and_wait'
  | 'set_proxy_and_wait'
  | 'set_location'
  | 'install_app_and_wait'
  | 'get_root'
  // 网络操作
  | 'download_url'
  | 'download_cloud'
  | 'http_request'
  // 脚本执行
  | 'shell'
  | 'start_bot'
  | 'run_script'
  | 'custom_js'
  // 流程控制
  | 'execute_repo_script'
  | 'set_variables'
  | 'network_check'
  | 'condition_check';

export interface RpaStep {
  id: string;
  type: StepType;
  name: string;
  params: Record<string, any>;
}

export interface RpaFlow {
  id: number;
  name: string;
  description: string;
  steps: RpaStep[];
  timeoutPerStep: number;
  retryCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 设备 RPA 状态
export interface DeviceRpaStatus {
  deviceId: number;
  rpaId: number;
  rpaName: string;
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  currentStep: number;
  totalSteps: number;
  stepName: string;
  subStep: number;
  subStepName: string;
  loopCount: number;
  totalTime: number; // 总耗时（秒）
  loopStartAt: string | null; // 当前循环开始时间
  scriptStatus: string;
  scriptProgress: number;
  lastError: string;
}

// 步骤类型信息
export interface StepTypeInfo {
  type: string;
  name: string;
  subSteps: string[];
  description?: string;
}

// 兼容旧版本的类型别名
export type RpaTask = RpaFlow;

export const useRpaStore = defineStore('rpa', () => {
  const flows = ref<RpaFlow[]>([]);
  const currentFlowId = ref<number | null>(null);
  const deviceStatuses = ref<DeviceRpaStatus[]>([]);
  const stepTypes = ref<StepTypeInfo[]>([]);
  const loading = ref(false);
  const engineRunning = ref(false);

  const currentFlow = computed(() => flows.value.find(f => f.id === currentFlowId.value) || null);

  // 兼容旧版本
  const tasks = flows;
  const currentTaskId = currentFlowId;
  const currentTask = currentFlow;

  // 加载流程列表
  async function loadFlows() {
    loading.value = true;
    try {
      const data = await backendApi.getRpaFlows();
      flows.value = data || [];
    } catch (e: any) {
      console.error('Failed to load RPA flows', e);
      // 静默失败，可能后端还没启动
    } finally {
      loading.value = false;
    }
  }

  // 兼容旧版本
  const loadTasks = loadFlows;

  // 创建流程
  async function createFlow(name: string = '新流程') {
    try {
      const newFlow = await backendApi.createRpaFlow({
        name,
        description: '',
        steps: [],
        timeoutPerStep: 300,
        retryCount: 0,
        enabled: true
      });
      flows.value.push(newFlow);
      currentFlowId.value = newFlow.id;
      return newFlow;
    } catch (e: any) {
      ElMessage.error('创建流程失败: ' + e.message);
      return null;
    }
  }

  // 兼容旧版本
  const createTask = createFlow;

  // 更新流程
  async function updateFlow(flow: RpaFlow) {
    try {
      const updated = await backendApi.updateRpaFlow(flow.id, flow);
      const index = flows.value.findIndex(f => f.id === flow.id);
      if (index !== -1) {
        flows.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      ElMessage.error('更新流程失败: ' + e.message);
      return null;
    }
  }

  // 兼容旧版本
  const updateTask = updateFlow;

  // 删除流程
  async function deleteFlow(id: number) {
    try {
      await backendApi.deleteRpaFlow(id);
      const index = flows.value.findIndex(f => f.id === id);
      if (index !== -1) {
        flows.value.splice(index, 1);
      }
      if (currentFlowId.value === id) {
        currentFlowId.value = null;
      }
      ElMessage.success('删除成功');
    } catch (e: any) {
      ElMessage.error('删除流程失败: ' + e.message);
    }
  }

  // 兼容旧版本（接受 string 或 number）
  const deleteTask = (id: string | number) => deleteFlow(typeof id === 'number' ? id : parseInt(id));

  // 选择流程
  function selectFlow(id: number) {
    currentFlowId.value = id;
  }

  // 兼容旧版本（接受 string 或 number）
  const selectTask = (id: string | number) => selectFlow(typeof id === 'number' ? id : parseInt(id));

  // 加载设备状态
  async function loadDeviceStatuses() {
    try {
      const data = await backendApi.getRpaDevices();
      deviceStatuses.value = data || [];
    } catch (e: any) {
      console.error('Failed to load device statuses', e);
    }
  }

  // 获取单个设备状态
  function getDeviceStatus(deviceId: number): DeviceRpaStatus | undefined {
    return deviceStatuses.value.find(d => d.deviceId === deviceId);
  }

  // 绑定设备到流程
  async function bindDevice(deviceId: number, rpaId: number, mode: 'single' | 'loop' = 'single') {
    try {
      await backendApi.bindDeviceRpa(deviceId, rpaId, mode);
      await loadDeviceStatuses();
      ElMessage.success('绑定成功');
    } catch (e: any) {
      ElMessage.error('绑定失败: ' + e.message);
    }
  }

  // 启动设备
  async function startDevice(deviceId: number) {
    try {
      await backendApi.startDeviceRpa(deviceId);
      await loadDeviceStatuses();
      ElMessage.success('启动成功');
    } catch (e: any) {
      ElMessage.error('启动失败: ' + e.message);
    }
  }

  // 暂停设备
  async function pauseDevice(deviceId: number) {
    try {
      await backendApi.pauseDeviceRpa(deviceId);
      await loadDeviceStatuses();
    } catch (e: any) {
      ElMessage.error('暂停失败: ' + e.message);
    }
  }

  // 恢复设备
  async function resumeDevice(deviceId: number) {
    try {
      await backendApi.resumeDeviceRpa(deviceId);
      await loadDeviceStatuses();
    } catch (e: any) {
      ElMessage.error('恢复失败: ' + e.message);
    }
  }

  // 停止设备
  async function stopDevice(deviceId: number) {
    try {
      await backendApi.stopDeviceRpa(deviceId);
      await loadDeviceStatuses();
      ElMessage.success('已停止');
    } catch (e: any) {
      ElMessage.error('停止失败: ' + e.message);
    }
  }

  // 加载步骤类型
  async function loadStepTypes() {
    try {
      const data = await backendApi.getRpaStepTypes();
      stepTypes.value = data || [];
    } catch (e: any) {
      console.error('Failed to load step types', e);
    }
  }

  // 加载引擎状态
  async function loadEngineStatus() {
    try {
      const data = await backendApi.getRpaEngineStatus();
      engineRunning.value = data?.running || false;
    } catch (e: any) {
      console.error('Failed to load engine status', e);
    }
  }

  // 启动引擎
  async function startEngine() {
    try {
      await backendApi.startRpaEngine();
      engineRunning.value = true;
      ElMessage.success('引擎已启动');
    } catch (e: any) {
      ElMessage.error('启动引擎失败: ' + e.message);
    }
  }

  // 停止引擎
  async function stopEngine() {
    try {
      await backendApi.stopRpaEngine();
      engineRunning.value = false;
      ElMessage.success('引擎已停止');
    } catch (e: any) {
      ElMessage.error('停止引擎失败: ' + e.message);
    }
  }

  // 导出流程
  function exportFlows() {
    const dataStr = JSON.stringify(flows.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpa_flows_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  }

  // 兼容旧版本
  const exportTasks = exportFlows;

  // 导入流程
  async function importFlows(file: File) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (Array.isArray(imported)) {
        for (const flow of imported) {
          // 创建新流程（忽略原 ID）
          await backendApi.createRpaFlow({
            name: flow.name,
            description: flow.description || '',
            steps: flow.steps || [],
            timeoutPerStep: flow.timeoutPerStep || 300,
            retryCount: flow.retryCount || 0,
            enabled: true
          });
        }
        await loadFlows();
        ElMessage.success(`导入 ${imported.length} 个流程成功`);
      } else {
        throw new Error('格式必须是数组');
      }
    } catch (e: any) {
      ElMessage.error('导入失败: ' + e.message);
    }
  }

  // 兼容旧版本
  const importTasks = importFlows;

  // 初始化
  async function init() {
    await Promise.all([
      loadFlows(),
      loadDeviceStatuses(),
      loadStepTypes(),
      loadEngineStatus()
    ]);
  }

  return {
    // 新版本 API
    flows,
    currentFlowId,
    currentFlow,
    deviceStatuses,
    stepTypes,
    loading,
    engineRunning,
    loadFlows,
    createFlow,
    updateFlow,
    deleteFlow,
    selectFlow,
    loadDeviceStatuses,
    getDeviceStatus,
    bindDevice,
    startDevice,
    pauseDevice,
    resumeDevice,
    stopDevice,
    loadStepTypes,
    loadEngineStatus,
    startEngine,
    stopEngine,
    exportFlows,
    importFlows,
    init,
    // 兼容旧版本 API
    tasks,
    currentTaskId,
    currentTask,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    exportTasks,
    importTasks,
    saveTasks: () => {} // 空函数，后端自动保存
  };
});
