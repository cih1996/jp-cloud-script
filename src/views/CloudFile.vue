
<template>
  <div class="cloud-file-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">Cloud File Management</span>
          <div class="header-actions">
            <el-tooltip content="上传功能暂不可用，请使用集控平台网页上传" placement="top">
              <el-button type="primary" disabled>
                <el-icon><Upload /></el-icon> Upload File
              </el-button>
            </el-tooltip>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { backendApi } from '@/api/backendApi';
import { ElMessage } from 'element-plus';
import { Upload, Refresh } from '@element-plus/icons-vue';

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

const handleCopyLink = async (row: FileItem) => {
  try {
    // URL is already included in the response from backend
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
