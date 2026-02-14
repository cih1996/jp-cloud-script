<!-- 左侧底部服务连接状态显示组件 -->
<template>
  <div class="service-status">
    <div class="status-indicator" :class="{ connected: isConnected }"></div>
    <span class="status-text">
      {{ isConnected ? $t('common.serviceConnected') : $t('common.serviceDisconnected') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { localService } from '@/api/localService';
import { useUnifiedWebSocket } from '@/composables/useUnifiedWebSocket';

const isConnected = ref(false);
let timer: any = null;
const { connect: connectUnifiedWS } = useUnifiedWebSocket();

const checkStatus = async () => {
  isConnected.value = await localService.checkHealth();
  if (isConnected.value) {
    connectUnifiedWS();
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
</style>
