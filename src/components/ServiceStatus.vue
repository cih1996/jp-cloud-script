<!-- 左侧底部服务连接状态显示组件 -->
<template>
  <div class="service-status">
    <div class="status-indicator" :class="{ connected: isConnected }"></div>
    <span class="status-text">
      {{ isConnected ? $t('common.serviceConnected') : $t('common.serviceDisconnected') }}
      <span v-if="isConnected && version" class="version">| {{ version }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useUnifiedWebSocket } from '@/composables/useUnifiedWebSocket';

const isConnected = ref(false);
const version = ref('');
let timer: any = null;
const { connect: connectUnifiedWS } = useUnifiedWebSocket();

const checkStatus = async () => {
  try {
    const res = await fetch('/health');
    if (res.ok) {
      const data = await res.json();
      isConnected.value = true;
      version.value = data.version ? `v${data.version}` : '';
      connectUnifiedWS();
    } else {
      isConnected.value = false;
      version.value = '';
    }
  } catch {
    isConnected.value = false;
    version.value = '';
  }
};

onMounted(() => {
  checkStatus();
  timer = window.setInterval(checkStatus, 15000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.service-status {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  font-size: 12px;
  color: #606266;
  background-color: #f9fafb;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
  transition: background-color 0.3s;
}

.status-indicator.connected {
  background-color: #67c23a;
}

.version {
  color: #909399;
}
</style>
