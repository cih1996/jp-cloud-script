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

const isConnected = ref(false);
let timer: number | null = null;

const checkStatus = async () => {
  isConnected.value = await localService.checkHealth();
};

onMounted(() => {
  checkStatus();
  timer = window.setInterval(checkStatus, 5000);
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
