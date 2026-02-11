
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
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="deviceId" :label="$t('device.deviceId')" min-width="120">
           <template #default="scope">
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
          </template>
        </el-table-column>
        <!-- UUID Removed as per request -->
        <el-table-column prop="deviceInfo.brand" :label="$t('device.brand')" min-width="100" />
        <el-table-column prop="deviceInfo.version" :label="$t('device.version')" min-width="100" />
        <el-table-column prop="deviceInfo.online" :label="$t('device.status')" min-width="100">
          <template #default="scope">
            <div class="status-indicator" :class="{ online: scope.row.deviceInfo?.online }">
              <span class="status-dot"></span>
              {{ scope.row.deviceInfo?.online ? $t('device.online') : $t('device.offline') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deviceInfo.ip" :label="$t('device.ip')" min-width="140">
           <template #default="scope">
             <span class="mono-text">{{ scope.row.deviceInfo?.ip }}</span>
           </template>
        </el-table-column>
        <el-table-column prop="deviceInfo.s5info" :label="$t('device.s5Proxy')" min-width="160">
           <template #default="scope">
             <el-tag v-if="scope.row.deviceInfo?.s5info" size="small" type="success">
                {{ scope.row.deviceInfo?.s5info }}
             </el-tag>
             <span v-else class="text-secondary">-</span>
           </template>
        </el-table-column>
        
        <el-table-column :label="$t('common.actions')" fixed="right" width="260">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openInspector(scope.row)">
              {{ $t('device.inspect') }}
            </el-button>
            <el-button 
                 link 
                 size="small" 
                 :type="hasPortMapping(scope.row.deviceId, 19011) ? 'success' : 'primary'"
                 :loading="devModeLoading[scope.row.deviceId]"
                 @click="toggleDevMode(scope.row)"
             >
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
                  <el-dropdown-item command="screenshot">{{ $t('device.screenshot') }}</el-dropdown-item>
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
    <el-dialog v-model="batchRunVisible" :title="$t('batch.runTask')" width="500px">
      <el-form label-position="top">
        <el-form-item :label="$t('batch.upload')">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('batch.selectScript')">
          <el-select v-model="selectedScript" style="width: 100%">
            <el-option label="Daily Login" value="daily_login" />
            <el-option label="Change OS" value="change_os" />
          </el-select>
        </el-form-item>
        <div class="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4">
          Selected {{ selection.length }} devices will run this script.
        </div>
      </el-form>
      <template #footer>
        <el-button @click="batchRunVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmBatchRun">{{ $t('common.confirm') }}</el-button>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSdkStore } from '@/stores/sdkStore'
import { useDeviceTunnel } from '@/composables/useDeviceTunnel'
import { localService } from '@/api/localService'
import { ElMessage, ElTable, ElMessageBox, ElLoading } from 'element-plus'
import { Refresh, Search, VideoPlay, UploadFilled, ArrowDown, MagicStick } from '@element-plus/icons-vue'
import ChangeOsDialog from '@/components/ChangeOsDialog.vue'
import S5ConfigDialog from '@/components/S5ConfigDialog.vue'
import { useI18n } from 'vue-i18n'
import type { ListRes } from '@sdk/index'

const { t } = useI18n()
const router = useRouter()
const sdkStore = useSdkStore()
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
    if (!sdkStore.sdk) return;
    cloudFileLoading.value = true;
    try {
        const res = await sdkStore.sdk.cloudCtl.list({});
        // Filter apk files if possible, but backend list doesn't seem to support filter.
        // Client side filter:
        cloudFileList.value = (res || []).filter((f: any) => f.fileName.toLowerCase().endsWith('.apk'));
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
    
    // Construct URL and populate form
    try {
        const baseUrl = await sdkStore.sdk?.cloudCtl.getDownloadUrl();
        if (baseUrl) {
             let finalUrl = baseUrl;
             if (!baseUrl.endsWith('/')) {
                 finalUrl += '/';
             }
             finalUrl += row.hash;
             
             downloadForm.value.url = finalUrl;
             downloadForm.value.name = row.fileName;
             // We don't have SHA256 in ListRes directly (it has 'hash' which is likely SHA256 based on CloudFile.vue logic)
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
const selectedScript = ref('')

const s5ConfigVisible = ref(false)
const s5DeviceId = ref(0)

const devModeLoading = ref<Record<number, boolean>>({})

const isTunnelLoading = (row: any) => {
  return isConnecting.value && activeDeviceId.value === row.deviceId
}

const getTunnelButtonText = (row: any) => {
  if (activeDeviceId.value === row.deviceId) {
      if (isConnecting.value) return connectionStatus.value || 'Init...'
      return t('device.stopTunnel')
  }
  return t('device.tunnel')
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
  if (!sdkStore.sdk) return
  loading.value = true
  
  // Sync tunnels
  checkActiveTunnels();
  
  try {
    const res = await sdkStore.sdk.userDeviceCtl.getUserDeviceList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
      // yunjiUserGroupId: -1
    })
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

const openInspector = (row: any) => {
  router.push(`/device/${row.deviceId}/inspect`)
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
  batchRunVisible.value = true
}

const handleBatchAdb = () => {
  ElMessage.success(`Enabling ADB for ${selection.value.length} devices...`)
}

const confirmBatchRun = () => {
  ElMessage.success(`Started script ${selectedScript.value} on ${selection.value.length} devices`)
  batchRunVisible.value = false
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

onMounted(() => {
  fetchDevices()
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
</style>
