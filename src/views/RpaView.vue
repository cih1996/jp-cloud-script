<template>
  <div class="rpa-view">
    <div class="ios-layout">
      <RpaSidebar class="sidebar" />
      <div class="main-content">
        <RpaEditor :all-devices="allDevices" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import RpaSidebar from './rpa/RpaSidebar.vue';
import RpaEditor from './rpa/RpaEditor.vue';
import { useSdkStore } from '@/stores/sdkStore';

const sdkStore = useSdkStore();
const allDevices = ref<any[]>([]);

const loadDevices = async () => {
    try {
        if (!sdkStore.sdk) return;
        const res = await sdkStore.sdk.userDeviceCtl.getUserDeviceList({
            pageNum: 1,
            pageSize: 9999
        });
        if (res && res.records) {
            allDevices.value = res.records;
        }
    } catch (e) {
        console.error('Failed to load devices', e);
    }
};

onMounted(() => {
    if (sdkStore.isConnected) {
        loadDevices();
    }
});

watch(() => sdkStore.isConnected, (val) => {
    if (val) loadDevices();
});
</script>

<style scoped lang="scss">
.rpa-view {
  height: 100vh;
  background-color: #f2f2f7;
  display: flex;
  flex-direction: column;
}

.ios-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background-color: #fff;
  border-right: 1px solid #e5e5ea;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.main-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f2f2f7;
}
</style>
