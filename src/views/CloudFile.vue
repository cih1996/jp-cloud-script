
<template>
  <div class="cloud-file-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">Cloud File Management</span>
          <div class="header-actions">
            <el-upload
              class="upload-demo"
              action="#"
              :show-file-list="false"
              :http-request="handleUpload"
              :disabled="uploading"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon> Upload File
              </el-button>
            </el-upload>
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
            <el-popconfirm title="Are you sure to delete this file?" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button link type="danger">Delete</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { ElMessage } from 'element-plus';
import { Upload, Refresh } from '@element-plus/icons-vue';
import type { UploadRequestOptions } from 'element-plus';
import type { ListRes } from '@sdk/index'; // Import from alias root

const sdkStore = useSdkStore();
const fileList = ref<ListRes[]>([]);
const loading = ref(false);
const uploading = ref(false);

const fetchFileList = async () => {
  if (!sdkStore.sdk) return;
  
  loading.value = true;
  try {
    const res = await sdkStore.sdk.cloudCtl.list({});
    fileList.value = res || [];
  } catch (error: any) {
    ElMessage.error('Failed to fetch file list: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const calculateHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  // Using SHA-256.
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const handleUpload = async (options: UploadRequestOptions) => {
  if (!sdkStore.sdk) {
      ElMessage.error("SDK not initialized");
      return;
  }
  
  const file = options.file;
  uploading.value = true;
  try {
    const hash = await calculateHash(file);
    const fileName = file.name;

    // 1. Get Upload URL
    const uploadUrl = await sdkStore.sdk.cloudCtl.getUploadUrl({ hash, fileName });
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    // 2. Upload to COS/S3
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    // 3. Confirm/Add File
    await sdkStore.sdk.cloudCtl.addCosFile({ hash, fileName });

    ElMessage.success('File uploaded successfully');
    fetchFileList();
  } catch (error: any) {
    console.error(error);
    ElMessage.error('Upload failed: ' + error.message);
  } finally {
    uploading.value = false;
  }
};

const handleDelete = async (row: ListRes) => {
  if (!sdkStore.sdk) return;
  try {
    await sdkStore.sdk.cloudCtl.del({ fileIds: [row.fileId] });
    ElMessage.success('File deleted');
    fetchFileList();
  } catch (error: any) {
    ElMessage.error('Delete failed: ' + error.message);
  }
};

const handleCopyLink = async (row: ListRes) => {
  if (!sdkStore.sdk) return;
  try {
    const baseUrl = await sdkStore.sdk.cloudCtl.getDownloadUrl();
    
    let finalUrl = baseUrl;
    if (baseUrl && !baseUrl.endsWith('/')) {
        finalUrl += '/';
    }
    finalUrl += row.fileName;

    await navigator.clipboard.writeText(finalUrl);
    ElMessage.success('Link copied to clipboard: ' + finalUrl);
  } catch (error: any) {
    ElMessage.error('Failed to get download URL: ' + error.message);
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
  if (sdkStore.isConnected) {
    fetchFileList();
  } else {
    // Watch or wait for connection? 
    // Usually SDK is ready when this view is loaded if guarded by login.
    // But for safety:
    const check = setInterval(() => {
        if (sdkStore.isConnected) {
            clearInterval(check);
            fetchFileList();
        }
    }, 500);
    setTimeout(() => clearInterval(check), 5000);
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
