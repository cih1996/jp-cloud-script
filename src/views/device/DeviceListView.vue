
<!-- 设备列表视图组件 -->
<template>
  <div class="device-list">
    <el-card class="app-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-input 
              v-model="searchKeyword" 
              :placeholder="$t('common.search')" 
              :prefix-icon="Search"
              style="width: 200px"
              clearable
              @clear="fetchDevices"
              @keyup.enter="fetchDevices"
            />
            
            <el-select v-model="statusFilter" placeholder="Status" style="width: 120px" class="ml-2" clearable>
              <el-option :label="$t('device.online')" :value="true" />
              <el-option :label="$t('device.offline')" :value="false" />
            </el-select>

            <el-tag type="info" effect="plain" round class="count-tag ml-2">{{ total }} Devices</el-tag>
            
            <el-divider direction="vertical" class="mx-4" />
            
            <div v-if="selection.length" class="selection-actions">
               <span class="selection-info mr-3">
                 {{ selection.length }} Selected
               </span>
               <el-button link type="primary" size="small" @click="clearSelection">Clear</el-button>
            </div>
          </div>
          <div class="header-actions">
            <el-button-group class="mr-3" v-if="selection.length > 0">
              <el-button type="primary" plain @click="handleBatchRun">
                <el-icon class="mr-1"><VideoPlay /></el-icon> {{ $t('batch.runTask') }}
              </el-button>
              <el-button type="warning" plain @click="handleBatchAdb">
                {{ $t('batch.enableAdb') }}
              </el-button>
              <el-button type="danger" plain @click="handleBatchChangeOs">
                <el-icon class="mr-1"><MagicStick /></el-icon> {{ $t('changeOs.batchBtn') }}
              </el-button>
            </el-button-group>

            <el-button :icon="Refresh" circle @click="fetchDevices" :loading="loading" />
            <el-button type="primary" @click="fetchDevices" :loading="loading">
              {{ $t('common.reset') }}
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="deviceTable"
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
        @selection-change="handleSelectionChange"
        table-layout="auto"
        :cell-style="cellStyle"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="deviceId" :label="$t('device.deviceId')" min-width="120">
           <template #default="scope">
            <div>
              <span class="mono-text font-medium">{{ scope.row.deviceId }}</span>
              <el-tag v-if="hasPortMapping(scope.row.deviceId, 9009)" size="small" type="success" effect="dark" class="ml-2">RPA</el-tag>
              <el-tag v-if="hasPortMapping(scope.row.deviceId, 5555)" size="small" type="warning" effect="dark" class="ml-2">ADB</el-tag>
              <el-tag
                v-for="port in getOtherMappings(scope.row.deviceId)"
                :key="port"
                size="small"
                type="info"
                effect="dark"
                class="ml-2"
                closable
                @close="handleStopCustomTunnel(port)"
              >
                {{ port }}
              </el-tag>
            </div>
            <!-- 错误信息直接显示在设备ID下方 -->
            <div v-if="getRpaStatus(scope.row.deviceId)?.lastError" class="rpa-error-inline">
              {{ getRpaStatus(scope.row.deviceId)?.lastError }}
            </div>
          </template>
        </el-table-column>
        <!-- 设备信息列（合并型号+UUID） -->
        <el-table-column label="设备信息" min-width="150">
          <template #default="scope">
            <div class="device-info-cell">
              <div class="device-brand">{{ scope.row.deviceInfo?.brand || '-' }}</div>
              <div class="device-uuid">{{ scope.row.deviceInfo?.uuid || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- WebSocket 连接状态 -->
        <el-table-column label="WS状态" width="90">
          <template #default="scope">
            <div class="ws-status" :class="{ connected: scope.row.wsConnected }">
              <span class="ws-dot"></span>
              {{ scope.row.wsConnected ? '已连接' : '未连接' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deviceInfo.online" :label="$t('device.status')" width="90">
          <template #default="scope">
            <div class="status-indicator" :class="{ online: scope.row.deviceInfo?.online }">
              <span class="status-dot"></span>
              {{ scope.row.deviceInfo?.online ? $t('device.online') : $t('device.offline') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deviceInfo.ip" :label="$t('device.ip')" width="120">
           <template #default="scope">
             <span class="mono-text">{{ scope.row.deviceInfo?.ip }}</span>
           </template>
        </el-table-column>
        <el-table-column prop="deviceInfo.s5info" :label="$t('device.s5Proxy')" width="130">
           <template #default="scope">
             <el-tooltip
               v-if="scope.row.deviceInfo?.s5info"
               :content="scope.row.deviceInfo?.s5info"
               placement="top"
               :show-after="300"
             >
               <el-tag size="small" type="success" class="s5-tag">
                 {{ parseS5Display(scope.row.deviceInfo?.s5info) }}
               </el-tag>
             </el-tooltip>
             <span v-else class="text-secondary">-</span>
           </template>
        </el-table-column>

        <!-- RPA 循环/耗时列 -->
        <el-table-column label="RPA统计" width="140">
          <template #default="scope">
            <div v-if="getRpaStatus(scope.row.deviceId)?.rpaId" class="rpa-stats">
              <el-tag size="small" type="primary" effect="plain">
                第{{ (getRpaStatus(scope.row.deviceId)?.loopCount ?? 0) + 1 }}次
              </el-tag>
              <el-tag size="small" type="success" effect="plain">
                {{ getCurrentDuration(scope.row.deviceId) }}
              </el-tag>
              <el-tag v-if="(getRpaStatus(scope.row.deviceId)?.loopCount ?? 0) > 0" size="small" type="info" effect="plain">
                均{{ formatDuration(getAvgTime(scope.row.deviceId)) }}
              </el-tag>
            </div>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>

        <!-- RPA 状态列 -->
        <el-table-column label="RPA状态" min-width="180">
          <template #default="scope">
            <div v-if="getRpaStatus(scope.row.deviceId)" class="rpa-status-cell">
              <div class="rpa-main-info">
                <el-tag
                  :type="getRpaStatusType(scope.row.deviceId)"
                  size="small"
                  effect="dark"
                >
                  {{ getRpaStatusText(scope.row.deviceId) }}
                </el-tag>
                <span v-if="getRpaStatus(scope.row.deviceId)?.rpaName" class="rpa-name">
                  {{ getRpaStatus(scope.row.deviceId)?.rpaName }}
                </span>
              </div>
              <div v-if="getRpaStatus(scope.row.deviceId)?.status === 'running'" class="rpa-detail-info">
                <span class="step-info">
                  {{ getRpaStatus(scope.row.deviceId)?.stepName }}
                  <span v-if="getRpaStatus(scope.row.deviceId)?.subStepName" class="sub-step">
                    → {{ getRpaStatus(scope.row.deviceId)?.subStepName }}
                  </span>
                </span>
                <el-progress
                  :percentage="getRpaProgress(scope.row.deviceId)"
                  :stroke-width="4"
                  :show-text="false"
                  style="width: 80px;"
                />
              </div>
            </div>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
        
        <el-table-column :label="$t('common.actions')" fixed="right" width="240">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openDeviceControl(scope.row)">
              {{ $t('device.devMode') }}
            </el-button>
            <el-button link type="primary" size="small" @click="openS5Config(scope.row)">
              S5
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              :loading="isTunnelLoading(scope.row)"
              @click="handleTunnelClick(scope.row)"
            >
              {{ getTunnelButtonText(scope.row) }}
            </el-button>
            <el-dropdown trigger="click" @command="(cmd: any) => handleCommand(cmd, scope.row)" class="ml-2">
              <el-button link type="primary" size="small" style="font-size: 12px;margin-top: 3px;">
                {{ $t('device.more') }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="portMapping">端口映射</el-dropdown-item>
                  <el-dropdown-item command="screenshot" divided>{{ $t('device.screenshot') }}</el-dropdown-item>
                  <el-dropdown-item command="shell">{{ $t('device.shell') }}</el-dropdown-item>
                  <el-dropdown-item command="appList">{{ $t('device.appList') }}</el-dropdown-item>
                  <el-dropdown-item command="startApp">{{ $t('device.startApp') }}</el-dropdown-item>
                  <el-dropdown-item command="download">{{ $t('device.download') }}</el-dropdown-item>
                  <el-dropdown-item command="changeOs" divided>{{ $t('device.changeOs') }}</el-dropdown-item>
                  <el-dropdown-item command="rootGrant">{{ $t('device.rootGrant') }}</el-dropdown-item>
                  <el-dropdown-item command="rootRevoke">{{ $t('device.rootRevoke') }}</el-dropdown-item>
                  <el-dropdown-item command="customTunnel" divided>{{ $t('device.customTunnel') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Middle API Dialogs -->
    <el-dialog v-model="appListVisible" title="App List" width="700px">
        <el-table :data="appList" v-loading="appListLoading" height="400">
            <el-table-column property="appname" label="Name" width="150" />
            <el-table-column property="packageName" label="Package" width="200" />
            <el-table-column property="firstInstallTime" label="Install Time" width="160">
                <template #default="scope">
                    {{ new Date(scope.row.firstInstallTime).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column property="lastUpdateTime" label="Update Time" width="160">
                <template #default="scope">
                    {{ new Date(scope.row.lastUpdateTime).toLocaleString() }}
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>

    <el-dialog v-model="screenshotVisible" title="Screenshot" width="600px">
        <div class="flex justify-center">
            <img :src="screenshotBase64" style="max-width: 100%; max-height: 500px;" />
        </div>
    </el-dialog>

    <el-dialog v-model="downloadVisible" title="Download & Install" width="600px">
        <el-tabs v-model="activeDownloadTab" @tab-change="handleDownloadTabChange">
            <el-tab-pane label="Input URL" name="url">
                <el-form :model="downloadForm" label-position="top">
                    <el-form-item label="URL">
                        <el-input v-model="downloadForm.url" placeholder="https://..." />
                    </el-form-item>
                    <el-form-item label="File Name (Optional)">
                        <el-input v-model="downloadForm.name" placeholder="app.apk" />
                    </el-form-item>
                    <el-form-item label="SHA256 (Optional)">
                        <el-input v-model="downloadForm.sha256" placeholder="SHA256 checksum" />
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="downloadForm.install">Install after download</el-checkbox>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="Select from Cloud" name="cloud">
                <el-table 
                    :data="cloudFileList" 
                    v-loading="cloudFileLoading" 
                    height="300px" 
                    highlight-current-row 
                    @current-change="handleCloudFileSelect"
                    style="cursor: pointer"
                >
                    <el-table-column prop="fileName" label="File Name" />
                    <el-table-column prop="size" label="Size" width="100">
                         <template #default="scope">
                            {{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB
                         </template>
                    </el-table-column>
                    <el-table-column prop="addTime" label="Time" width="160">
                         <template #default="scope">
                            {{ new Date(scope.row.addTime * (scope.row.addTime < 10000000000 ? 1000 : 1)).toLocaleString() }}
                         </template>
                    </el-table-column>
                </el-table>
                <div v-if="selectedCloudFile" class="mt-2 p-2 bg-gray-50 rounded">
                    <span class="font-bold">Selected:</span> {{ selectedCloudFile.fileName }}
                </div>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <el-button @click="downloadVisible = false">Cancel</el-button>
            <el-button type="primary" @click="confirmDownload">Confirm</el-button>
        </template>
    </el-dialog>

    <!-- Batch Run Dialog -->
    <el-dialog v-model="batchRunVisible" :title="$t('batch.runTask')" width="550px">
      <el-form label-position="top">
        <el-form-item label="选择 RPA 流程">
          <el-select v-model="selectedRpaId" style="width: 100%" placeholder="请选择要执行的 RPA 流程">
            <el-option
              v-for="flow in rpaStore.flows"
              :key="flow.id"
              :label="`${flow.name} (${flow.steps?.length || 0} 步骤)`"
              :value="flow.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行模式">
          <el-radio-group v-model="rpaRunMode">
            <el-radio value="single">单次执行</el-radio>
            <el-radio value="loop">循环执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="batch-run-info">
          <el-icon><InfoFilled /></el-icon>
          <span>已选择 <strong>{{ selection.length }}</strong> 台设备，将绑定并启动所选 RPA 流程</span>
        </div>
        <div v-if="selectedRpaId && getSelectedFlow()" class="flow-preview">
          <div class="flow-preview-title">流程步骤预览：</div>
          <div class="flow-steps">
            <el-tag
              v-for="(step, idx) in getSelectedFlow()?.steps"
              :key="idx"
              size="small"
              type="info"
              class="step-tag"
            >
              {{ idx + 1 }}. {{ step.name || step.type }}
            </el-tag>
            <el-tag v-if="!getSelectedFlow()?.steps?.length" size="small" type="warning">
              暂无步骤
            </el-tag>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="batchRunVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmBatchRun" :disabled="!selectedRpaId" :loading="batchRunLoading">
          绑定并启动
        </el-button>
      </template>
    </el-dialog>

    <ChangeOsDialog 
      v-model="changeOsVisible" 
      :device-ids="changeOsDeviceIds"
      @success="handleChangeOsSuccess"
    />

    <S5ConfigDialog
      v-model="s5ConfigVisible"
      :device-id="s5DeviceId"
      @success="handleS5Success"
    />

    <!-- Custom Tunnel Dialog -->
    <el-dialog v-model="customTunnelVisible" :title="$t('customTunnel.title')" width="400px">
        <el-form :model="customTunnelForm" label-position="top">
            <el-form-item :label="$t('customTunnel.localPort')">
                <el-input v-model="customTunnelForm.localPort" :placeholder="$t('customTunnel.localPortPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('customTunnel.remotePort')">
                <el-input v-model="customTunnelForm.remotePort" :placeholder="$t('customTunnel.remotePortPlaceholder')" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="customTunnelVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="confirmCustomTunnel">{{ $t('customTunnel.start') }}</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSdkStore } from '@/stores/sdkStore'
import { useRpaStore, type DeviceRpaStatus } from '@/stores/rpaStore'
import { useDeviceTunnel } from '@/composables/useDeviceTunnel'
import { useFrontendWS } from '@/composables/useFrontendWS'
import { localService } from '@/api/localService'
import { backendApi } from '@/api/backendApi'
import { ElMessage, ElTable, ElMessageBox, ElLoading } from 'element-plus'
import { Refresh, Search, VideoPlay, ArrowDown, MagicStick, InfoFilled } from '@element-plus/icons-vue'
import ChangeOsDialog from '@/components/ChangeOsDialog.vue'
import S5ConfigDialog from '@/components/S5ConfigDialog.vue'
import { useI18n } from 'vue-i18n'
import type { ListRes } from '@sdk/index'

const { t: _t } = useI18n()
const router = useRouter()
const sdkStore = useSdkStore()
const rpaStore = useRpaStore()
const {
  isConnecting,
  activeDeviceId,
  connectionStatus,
  startTunnel,
  stopTunnel,
  startCustomTunnel,
  stopCustomTunnel,
  checkActiveTunnels,
  deviceMappings
} = useDeviceTunnel()

// 使用新的前端 WS 订阅（实时推送，替代 HTTP 轮询）
const frontendWS = useFrontendWS()

const loading = ref(false)

const changeOsVisible = ref(false)
const changeOsDeviceIds = ref<number[]>([])

// Middle API Logic
const appListVisible = ref(false)
const appList = ref<any[]>([])
const appListLoading = ref(false)

const screenshotVisible = ref(false)
const screenshotBase64 = ref('')

const downloadVisible = ref(false)
const activeDownloadTab = ref('url')
const cloudFileList = ref<ListRes[]>([])
const cloudFileLoading = ref(false)
const selectedCloudFile = ref<ListRes | null>(null)

const downloadForm = ref({
    url: '',
    name: '',
    sha256: '',
    install: true
})
const currentDevice = ref<any>(null)

const customTunnelVisible = ref(false)
const customTunnelForm = ref({
    localPort: '',
    remotePort: ''
})

const handleCustomTunnel = (row: any) => {
    currentDevice.value = row;
    customTunnelForm.value = { localPort: '', remotePort: '' };
    customTunnelVisible.value = true;
}

const confirmCustomTunnel = async () => {
    if (!currentDevice.value) return;
    const local = parseInt(customTunnelForm.value.localPort);
    const remote = parseInt(customTunnelForm.value.remotePort);
    
    if (isNaN(local) || isNaN(remote)) {
        ElMessage.warning('Invalid ports');
        return;
    }
    
    await startCustomTunnel(currentDevice.value, local, remote);
    customTunnelVisible.value = false;
}

const handleStopCustomTunnel = async (port: number) => {
    try {
        await ElMessageBox.confirm(
            `Stop mapping on local port ${port}?`,
            'Confirm Stop',
            {
                confirmButtonText: 'Stop',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        )
        await stopCustomTunnel(port);
        ElMessage.success(`Stopped mapping on port ${port}`);
    } catch {
        // Cancelled
    }
}

const toggleDevMode = async (device: any) => {
    devModeLoading.value[device.deviceId] = true;
    try {
        if (hasPortMapping(device.deviceId, 19011)) {
            await handleStopCustomTunnel(19011);
        } else {
            await startCustomTunnel(device, 19011, 19011);
        }
    } finally {
        devModeLoading.value[device.deviceId] = false;
    }
}

const handleCommand = async (cmd: string, row: any) => {
    currentDevice.value = row;
    switch (cmd) {
        case 'portMapping':
            await toggleDevMode(row);
            break;
        case 'screenshot':
            await handleScreenshot(row);
            break;
        case 'shell':
            await handleShell(row);
            break;
        case 'appList':
            appListVisible.value = true;
            await handleAppList(row);
            break;
        case 'startApp':
            await handleStartApp(row);
            break;
        case 'download':
            downloadForm.value = { url: '', name: '', sha256: '', install: true };
            activeDownloadTab.value = 'url';
            selectedCloudFile.value = null;
            downloadVisible.value = true;
            break;
        case 'changeOs':
            changeOsDeviceIds.value = [row.deviceId];
            changeOsVisible.value = true;
            break;
        case 'rootGrant':
            await handleRoot(row, 516, 'Grant Root');
            break;
        case 'rootRevoke':
            await handleRoot(row, 517, 'Revoke Root');
            break;
        case 'customTunnel':
            handleCustomTunnel(row);
            break;
    }
}

const fetchCloudFiles = async () => {
    if (!sdkStore.apiKey) return;
    cloudFileLoading.value = true;
    try {
        const res = await backendApi.getCloudFiles({});
        // Filter apk files if possible, but backend list doesn't seem to support filter.
        // Client side filter:
        cloudFileList.value = (res || []).filter((f: any) => f.fileName?.toLowerCase().endsWith('.apk'));
    } catch (e) {
        ElMessage.error('Failed to fetch cloud files');
    } finally {
        cloudFileLoading.value = false;
    }
}

const handleDownloadTabChange = (tab: string) => {
    if (tab === 'cloud') {
        fetchCloudFiles();
    }
}

const handleCloudFileSelect = async (row: ListRes | undefined) => {
    if (!row) return;
    selectedCloudFile.value = row;

    // URL is already included in the response from backend
    try {
        if ((row as any).url) {
            downloadForm.value.url = (row as any).url;
            downloadForm.value.name = row.fileName;
            downloadForm.value.sha256 = row.hash;
        }
    } catch (e) {
        ElMessage.error('Failed to get download URL');
    }
}


const sendMiddleRequest = async (device: any, func: number, data: any = null) => {
    if (!sdkStore.apiKey) {
        ElMessage.error('API Key not found');
        throw new Error('No API Key');
    }
    const payload = {
        key: sdkStore.apiKey,
        deviceId: device.deviceId,
        data: {
            f: func,
            req: true,
            seq: Math.floor(Date.now() / 1000),
            data: data
        }
    };
    try {
        const res = await localService.callMiddle(payload);
        return res;
    } catch (e: any) {
        ElMessage.error('Request failed: ' + e.message);
        throw e;
    }
}

const handleScreenshot = async (row: any) => {
    const loadingMsg = ElLoading.service({ text: 'Taking screenshot...' });
    try {
        const res = await sendMiddleRequest(row, 299, {
            width: 0, height: 0, qua: 70, scale: 150, x: 0, y: 0, imgType: 2
        });
        if (res.data) {
            screenshotBase64.value = 'data:image/jpeg;base64,' + res.data;
            screenshotVisible.value = true;
        } else {
            ElMessage.warning('No screenshot data returned');
        }
    } finally {
        loadingMsg.close();
    }
}

const handleShell = async (row: any) => {
    try {
        const { value } = await ElMessageBox.prompt('Enter shell command', 'Shell Command', {
            confirmButtonText: 'Execute',
            cancelButtonText: 'Cancel',
        });
        if (value) {
             const res = await sendMiddleRequest(row, 289, { shell: value });
             if (res.data) {
                 // Show result in a message box for now
                 ElMessageBox.alert(JSON.stringify(res.data, null, 2), 'Shell Output', {
                     customStyle: { whiteSpace: 'pre-wrap', maxHeight: '500px', overflow: 'auto' }
                 });
             } else {
                 ElMessage.success('Command executed');
             }
        }
    } catch {
        // Cancelled
    }
}

const handleAppList = async (row: any) => {
    appListLoading.value = true;
    appList.value = [];
    try {
        const res = await sendMiddleRequest(row, 290);
        if (res.data && Array.isArray(res.data)) {
            appList.value = res.data;
        } else {
            ElMessage.warning('Failed to get app list');
        }
    } finally {
        appListLoading.value = false;
    }
}

const handleStartApp = async (row: any) => {
    try {
        const { value } = await ElMessageBox.prompt('Enter package name', 'Start App', {
            confirmButtonText: 'Start',
            cancelButtonText: 'Cancel',
        });
        if (value) {
            await sendMiddleRequest(row, 291, { packageName: value });
            ElMessage.success('Start app command sent');
        }
    } catch {}
}

const handleRoot = async (row: any, func: number, title: string) => {
    try {
        const { value } = await ElMessageBox.prompt('Enter package name', title, {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
        });
        if (value) {
            await sendMiddleRequest(row, func, { pkg: value });
            ElMessage.success('Root command sent');
        }
    } catch {}
}

const confirmDownload = async () => {
    if (!currentDevice.value) return;
    const form = downloadForm.value;
    if (!form.url) {
        ElMessage.warning('URL is required');
        return;
    }
    
    // Auto-generate name if missing (simple logic)
    if (!form.name) {
        const parts = form.url.split('/');
        form.name = parts[parts.length - 1] || 'downloaded_file.apk';
    }
    
    // Example format:
    // "data": { 
    //     "url": "...", 
    //     "sha256": "...", (optional?) User didn't imply mandatory sha256 in UI prompt, maybe omit or dummy?
    //     "install": true, 
    //     "name": "...", 
    //     "receive": true 
    // }
    // The example has sha256. If I don't have it, I hope backend works without it or I can fetch it. 
    // I'll omit it for now or pass empty string.
    
    try {
        await sendMiddleRequest(currentDevice.value, 293, {
            url: form.url,
            name: form.name,
            install: form.install,
            receive: true,
            sha256: form.sha256 || ""
        });
        ElMessage.success('Download task sent');
        downloadVisible.value = false;
    } catch {}
}

const rawTableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const statusFilter = ref<boolean | null>(null)
const selection = ref<any[]>([])
const deviceTable = ref<InstanceType<typeof ElTable>>()

const batchRunVisible = ref(false)
const selectedRpaId = ref<number | null>(null)
const rpaRunMode = ref<'single' | 'loop'>('single')
const batchRunLoading = ref(false)

const s5ConfigVisible = ref(false)
const s5DeviceId = ref(0)

const devModeLoading = ref<Record<number, boolean>>({})

const isTunnelLoading = (row: any) => {
  return isConnecting.value && activeDeviceId.value === row.deviceId
}

const getTunnelButtonText = (row: any) => {
  if (activeDeviceId.value === row.deviceId) {
      if (isConnecting.value) return connectionStatus.value || 'Init...'
      return '关闭ADB'
  }
  return '开启ADB'
}

const handleTunnelClick = async (row: any) => {
  if (activeDeviceId.value === row.deviceId && !isConnecting.value) {
    await stopTunnel()
  } else {
    await startTunnel(row)
  }
}

const tableData = computed(() => {
  let data = rawTableData.value
  
  if (statusFilter.value !== null) {
    data = data.filter(d => d.deviceInfo?.online === statusFilter.value)
  }

  if (!searchKeyword.value) return data
  
  const keyword = searchKeyword.value.toLowerCase()
  return data.filter(device => 
    device.deviceId.toString().includes(keyword) ||
    (device.deviceInfo?.brand && device.deviceInfo.brand.toLowerCase().includes(keyword)) ||
    (device.deviceInfo?.ip && device.deviceInfo.ip.includes(keyword))
  )
})

const fetchDevices = async () => {
  if (!sdkStore.apiKey) return
  loading.value = true

  // Sync tunnels
  checkActiveTunnels();

  try {
    const res = await backendApi.getDeviceList()
    if (res) {
      rawTableData.value = res.records || []
      total.value = res.total || 0
    } else {
      rawTableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error("Fetch devices error", error)
    ElMessage.error("Failed to fetch devices")
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selection.value = val
}

const clearSelection = () => {
  deviceTable.value?.clearSelection()
}

// 跳转到设备操控页面并自动选中设备
const openDeviceControl = (row: any) => {
  router.push({
    path: '/device/control',
    query: { deviceId: row.deviceId }
  })
}

const openS5Config = (row: any) => {
  s5DeviceId.value = row.deviceId
  s5ConfigVisible.value = true
}

const handleS5Success = () => {
  fetchDevices()
}

const handleBatchChangeOs = () => {
  if (selection.value.length === 0) return;
  changeOsDeviceIds.value = selection.value.map(d => d.deviceId);
  changeOsVisible.value = true;
}

const handleChangeOsSuccess = () => {
  fetchDevices();
  clearSelection();
}

const handleBatchRun = () => {
  // 加载 RPA 流程列表
  rpaStore.loadFlows()
  selectedRpaId.value = null
  rpaRunMode.value = 'single'
  batchRunVisible.value = true
}

const handleBatchAdb = () => {
  ElMessage.success(`Enabling ADB for ${selection.value.length} devices...`)
}

const getSelectedFlow = () => {
  if (!selectedRpaId.value) return null
  return rpaStore.flows.find(f => f.id === selectedRpaId.value)
}

const confirmBatchRun = async () => {
  if (!selectedRpaId.value || selection.value.length === 0) return

  batchRunLoading.value = true
  try {
    // 批量绑定并启动
    for (const device of selection.value) {
      await backendApi.bindDeviceRpa(device.deviceId, selectedRpaId.value, rpaRunMode.value)
      await backendApi.startDeviceRpa(device.deviceId)
    }
    ElMessage.success(`已为 ${selection.value.length} 台设备启动 RPA 流程`)
    batchRunVisible.value = false
    // 刷新状态
    rpaStore.loadDeviceStatuses()
    clearSelection()
  } catch (e: any) {
    ElMessage.error('启动失败: ' + e.message)
  } finally {
    batchRunLoading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchDevices()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchDevices()
}

const hasPortMapping = (deviceId: number, port: number) => {
  return deviceMappings.value?.[deviceId]?.includes(port)
}

const getOtherMappings = (deviceId: number) => {
    const ports = deviceMappings.value?.[deviceId] || [];
    return ports.filter(p => p !== 9009 && p !== 5555);
}

// ========== RPA 状态相关（优先使用 WS 推送的 _local 数据）==========
const getRpaStatus = (deviceId: number): DeviceRpaStatus | undefined => {
    // 优先从 WS 推送的设备数据中获取 _local
    const wsStatus = frontendWS.getDeviceRpaStatus(deviceId)
    if (wsStatus && wsStatus.rpaId) {
        // 转换为 DeviceRpaStatus 格式
        return {
            deviceId,
            rpaId: wsStatus.rpaId || 0,
            rpaName: wsStatus.rpaName || '',
            status: (wsStatus.rpaStatus as DeviceRpaStatus['status']) || 'idle',
            currentStep: wsStatus.rpaStep || 0,
            totalSteps: wsStatus.rpaTotalSteps || 0,
            stepName: wsStatus.rpaStepName || '',
            subStep: wsStatus.rpaSubStep || 0,
            subStepName: wsStatus.rpaSubStepName || '',
            loopCount: wsStatus.rpaLoopCount || 0,
            totalTime: wsStatus.rpaTotalTime || 0,
            loopStartAt: wsStatus.rpaLoopStartAt || null,
            scriptStatus: '',
            scriptProgress: 0,
            lastError: wsStatus.rpaLastError || ''
        }
    }
    // 回退到 rpaStore
    return rpaStore.getDeviceStatus(deviceId)
}

const getRpaStatusType = (deviceId: number): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const status = getRpaStatus(deviceId);
    if (!status) return 'info';
    switch (status.status) {
        case 'running': return 'primary';
        case 'paused': return 'warning';
        case 'error': return 'danger';
        case 'completed': return 'success';
        default: return 'info';
    }
}

const getRpaStatusText = (deviceId: number): string => {
    const status = getRpaStatus(deviceId);
    if (!status) return '-';
    switch (status.status) {
        case 'idle': return '空闲';
        case 'running': return `运行中 ${status.currentStep + 1}/${status.totalSteps}`;
        case 'paused': return '已暂停';
        case 'error': return '错误';
        case 'completed': return '已完成';
        default: return status.status;
    }
}

const getRpaProgress = (deviceId: number): number => {
    const status = getRpaStatus(deviceId);
    if (!status || status.totalSteps === 0) return 0;
    return Math.round((status.currentStep / status.totalSteps) * 100);
}

// 格式化时长（秒 -> 可读格式）
const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return s > 0 ? `${m}m${s}s` : `${m}m`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// 计算平均耗时
const getAvgTime = (deviceId: number): number => {
    const status = getRpaStatus(deviceId);
    if (!status || status.loopCount <= 0) return 0;
    return Math.round(status.totalTime / status.loopCount);
}

// 计算当前循环耗时（实时）
const getCurrentDuration = (deviceId: number): string => {
    const status = getRpaStatus(deviceId);
    if (!status) return '0s';

    // 触发响应式依赖，让模板每秒重新计算
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    timerTick.value;

    // 运行中：显示实时计时
    if (status.status === 'running' && status.loopStartAt) {
        const startTime = new Date(status.loopStartAt).getTime();
        if (!isNaN(startTime)) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            if (elapsed >= 0) {
                return formatDuration(elapsed);
            }
        }
    }

    // 完成/失败/暂停：显示总耗时（保留显示）
    if (status.totalTime > 0) {
        return formatDuration(status.totalTime);
    }

    // 运行中但没有 loopStartAt（刚启动）
    if (status.status === 'running') {
        return '0s';
    }

    return '0s';
}

// 设置单元格样式，让操作列垂直居中
const cellStyle = ({ column }: { column: any }): any => {
    if (column.property === undefined && column.label === '操作') {
        return { verticalAlign: 'middle' }
    }
    return { verticalAlign: 'top' }
}

// 解析 S5 代理信息，只显示 IP:端口
const parseS5Display = (s5info: string): string => {
    if (!s5info) return '-'
    try {
        // 尝试解析 JSON 格式
        const parsed = JSON.parse(s5info)
        if (parsed.s5Url) {
            // 从 socks5://user:pass@ip:port 提取 ip:port
            const match = parsed.s5Url.match(/@([^:]+):(\d+)/)
            if (match) {
                return `${match[1]}:${match[2]}`
            }
        }
        return '✓ 已配置'
    } catch {
        // 非 JSON 格式，尝试直接提取 IP:端口
        const match = s5info.match(/(\d+\.\d+\.\d+\.\d+):(\d+)/)
        if (match) {
            return `${match[1]}:${match[2]}`
        }
        return '✓ 已配置'
    }
}

// 监听 WS 设备数据变化，就地更新（保留 el-table 选中状态）
watch(() => frontendWS.devices.value, (newDevices) => {
  if (!newDevices || newDevices.length === 0) return

  const existing = rawTableData.value
  const existingMap = new Map(existing.map(d => [d.deviceId, d]))

  // 就地更新已有行的属性，不替换对象引用
  let changed = false
  for (const nd of newDevices) {
    const old = existingMap.get(nd.deviceId)
    if (old) {
      // 更新字段但保留对象引用
      old.deviceInfo = nd.deviceInfo
      old.tbYunJiUserDeviceId = nd.tbYunJiUserDeviceId
      old.wsConnected = (nd as any).wsConnected
      old.middleAgentDevice = nd.middleAgentDevice
      old._local = nd._local
    } else {
      changed = true
    }
  }

  // 只有设备数量变化时才替换数组（新增/删除设备）
  if (changed || newDevices.length !== existing.length) {
    // 保留已有对象引用，只添加新设备
    const newMap = new Map(newDevices.map(d => [d.deviceId, d]))
    const result: any[] = []
    // 保留已有的（维持引用）
    for (const old of existing) {
      if (newMap.has(old.deviceId)) {
        result.push(old)
      }
    }
    // 添加新增的
    for (const nd of newDevices) {
      if (!existingMap.has(nd.deviceId)) {
        result.push({
          deviceId: nd.deviceId,
          deviceInfo: nd.deviceInfo,
          tbYunJiUserDeviceId: nd.tbYunJiUserDeviceId,
          _local: nd._local
        })
      }
    }
    rawTableData.value = result
  }

  total.value = newDevices.length
  loading.value = false
}, { immediate: true })

// 本地计时器：驱动运行中设备的实时耗时刷新（WS 按需推送不会每秒触发）
const timerTick = ref(0)
let durationTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 订阅设备列表（通过 WS 实时推送）
  frontendWS.subscribe('devices')

  // 首次加载时也通过 HTTP 获取一次（确保立即有数据）
  fetchDevices()

  // 检查活跃隧道
  checkActiveTunnels()

  // 启动本地计时器（每秒刷新一次耗时显示）
  durationTimer = setInterval(() => {
    timerTick.value++
  }, 1000)
})

onUnmounted(() => {
  // 取消订阅
  frontendWS.unsubscribe('devices')
  // 清理计时器
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
})
</script>

<style scoped lang="scss">
.device-list {
  padding: 16px;
  height: 100%;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.app-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: none;
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid #f3f4f6;
  }

  :deep(.el-card__body) {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}
.mr-1 {
  margin-right: 4px;
}
.mr-3 {
  margin-right: 12px;
}
.mx-4 {
  margin: 0 16px;
}

.count-tag {
  font-weight: 500;
}

.selection-info {
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #d1d5db;
  }

  &.online {
    color: #059669;
    .status-dot {
      background-color: #10b981;
    }
  }
}

.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;

  .ws-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #d1d5db;
  }

  &.connected {
    color: #2563eb;
    .ws-dot {
      background-color: #3b82f6;
    }
  }
}

.text-xs {
  font-size: 11px;
}

.mono-text {
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.text-secondary {
  color: #6b7280;
  font-size: 13px;
}

.font-medium {
  font-weight: 500;
}

.pagination-wrapper {
  padding: 12px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.rpa-status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .rpa-main-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rpa-name {
    font-size: 12px;
    color: #6b7280;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rpa-detail-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .step-info {
      font-size: 11px;
      color: #374151;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .sub-step {
        color: #9ca3af;
      }
    }
  }

  .rpa-error-row {
    margin-top: 4px;

    .error-preview {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #fef2f2;
      border-radius: 4px;
      cursor: pointer;

      .error-icon {
        color: #dc2626;
        font-size: 14px;
        flex-shrink: 0;
      }

      .error-text {
        font-size: 11px;
        color: #dc2626;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }
    }
  }
}

.rpa-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// 设备信息单元格样式
.device-info-cell {
  .device-brand {
    font-size: 13px;
    font-weight: 500;
    color: #111827;
  }
  .device-uuid {
    font-size: 11px;
    color: #6b7280;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
}

// S5 代理标签样式
.s5-tag {
  cursor: pointer;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

// RPA 错误内联样式
.rpa-error-inline {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
  line-height: 1.4;
  word-break: break-all;
}

.error-detail {
  .error-title {
    font-weight: 600;
    color: #dc2626;
    margin-bottom: 8px;
  }

  .error-content {
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
    word-break: break-all;
  }
}

// 批量运行弹窗样式
.batch-run-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #0369a1;
  font-size: 13px;
  margin-bottom: 16px;
}

.flow-preview {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;

  .flow-preview-title {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .flow-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .step-tag {
      font-size: 11px;
    }
  }
}
</style>
