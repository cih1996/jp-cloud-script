
<template>
  <div class="cloud-file-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">Cloud File Management</span>
          <div class="header-actions">
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><Upload /></el-icon> Upload File
            </el-button>
            <el-button @click="fetchFileList" :icon="Refresh">Refresh</el-button>
          </div>
        </div>
      </template>

      <el-table :data="fileList" style="width: 100%" v-loading="loading">
        <el-table-column prop="fileId" label="ID" width="100" />
        <el-table-column prop="fileName" label="File Name" min-width="200" />
        <el-table-column prop="size" label="Size" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="addTime" label="Upload Time" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.addTime) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleCopyLink(scope.row)">Copy Link</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 上传弹窗 -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px" :close-on-click-modal="false">
      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :disabled="uploading"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
      </el-upload>

      <div v-if="uploading" style="margin-top: 16px;">
        <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
        <p style="margin-top: 8px; color: #909399; font-size: 13px;">{{ uploadStatusText }}</p>
      </div>

      <template #footer>
        <el-button @click="cancelUpload" :disabled="uploading">取消</el-button>
        <el-button type="primary" @click="startUpload" :loading="uploading" :disabled="!selectedFile">
          {{ uploading ? '上传中...' : '开始上传' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { backendApi } from '@/api/backendApi';
import { ElMessage } from 'element-plus';
import { Upload, Refresh } from '@element-plus/icons-vue';
import type { UploadInstance, UploadFile, UploadRawFile } from 'element-plus';

interface FileItem {
  fileId: number;
  fileName: string;
  hash: string;
  size: number;
  addTime: number;
  url?: string;
}

const sdkStore = useSdkStore();
const fileList = ref<FileItem[]>([]);
const loading = ref(false);

// 上传相关状态
const showUploadDialog = ref(false);
const uploadRef = ref<UploadInstance>();
const selectedFile = ref<UploadRawFile | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatusText = ref('');

const fetchFileList = async () => {
  if (!sdkStore.apiKey) return;

  loading.value = true;
  try {
    const res = await backendApi.getCloudFiles({});
    fileList.value = res || [];
  } catch (error: any) {
    ElMessage.error('Failed to fetch file list: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 计算文件 SHA256 hash
const computeSHA256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleFileChange = (uploadFile: UploadFile) => {
  selectedFile.value = uploadFile.raw || null;
};

const handleExceed = () => {
  ElMessage.warning('只能选择一个文件，请先移除已选文件');
};

const cancelUpload = () => {
  showUploadDialog.value = false;
  selectedFile.value = null;
  uploadProgress.value = 0;
  uploadStatusText.value = '';
  uploadRef.value?.clearFiles();
};

const startUpload = async () => {
  if (!selectedFile.value) return;

  const file = selectedFile.value;
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 1. 计算 hash
    uploadStatusText.value = '正在计算文件指纹...';
    const hash = await computeSHA256(file);

    // 2. 尝试秒传
    uploadStatusText.value = '正在检测秒传...';
    const fastResult = await backendApi.fastUpload(hash, file.name);
    if (fastResult.exists) {
      ElMessage.success('秒传成功！文件已存在');
      cancelUpload();
      await fetchFileList();
      return;
    }

    // 3. 完整上传
    uploadStatusText.value = '正在上传文件...';
    await backendApi.uploadFile(file, hash, (percent: number) => {
      uploadProgress.value = percent;
    });

    uploadProgress.value = 100;
    uploadStatusText.value = '上传完成';
    ElMessage.success('文件上传成功');

    // 4. 刷新列表
    cancelUpload();
    await fetchFileList();
  } catch (error: any) {
    ElMessage.error('上传失败: ' + error.message);
    uploadStatusText.value = '上传失败: ' + error.message;
  } finally {
    uploading.value = false;
  }
};

const handleCopyLink = async (row: FileItem) => {
  try {
    const url = row.url || '';
    if (url) {
      await navigator.clipboard.writeText(url);
      ElMessage.success('Link copied to clipboard');
    } else {
      ElMessage.warning('No download URL available');
    }
  } catch (error: any) {
    ElMessage.error('Failed to copy link: ' + error.message);
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (timestamp: number) => {
  const time = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  return new Date(time).toLocaleString();
};

onMounted(() => {
  if (sdkStore.apiKey) {
    fetchFileList();
  }
});
</script>

<style scoped>
.cloud-file-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>
