<template>
  <div class="rpa-view">
    <div class="ios-layout">
      <div class="sidebar-container">
        <el-tabs v-model="activeTab" class="sidebar-tabs">
          <el-tab-pane :label="t('rpa.flows')" name="flows">
            <RpaSidebar class="sidebar" />
          </el-tab-pane>
          <el-tab-pane :label="t('rpa.history')" name="history">
            <RpaHistory />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="main-content" v-show="activeTab === 'flows'">
        <RpaEditor :all-devices="allDevices" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import RpaSidebar from './rpa/RpaSidebar.vue';
import RpaEditor from './rpa/RpaEditor.vue';
import RpaHistory from './rpa/RpaHistory.vue';
import { useSdkStore } from '@/stores/sdkStore';
import { backendApi } from '@/api/backendApi';

const { t } = useI18n();
const sdkStore = useSdkStore();
const allDevices = ref<any[]>([]);
const activeTab = ref('flows');

const loadDevices = async () => {
    try {
        if (!sdkStore.apiKey) return;
        const res = await backendApi.getDeviceList();
        if (res && res.records) {
            allDevices.value = res.records;
        }
    } catch (e) {
        console.error('Failed to load devices', e);
    }
};

onMounted(() => {
    if (sdkStore.apiKey) {
        loadDevices();
    }
});

watch(() => sdkStore.apiKey, (val) => {
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

.sidebar-container {
  width: 360px;
  background-color: #fff;
  border-right: 1px solid #e5e5ea;
  display: flex;
  flex-direction: column;
  z-index: 10;

  .sidebar-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 16px;
      background: #f8f8f8;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;

      .el-tab-pane {
        height: 100%;
        overflow: auto;
      }
    }
  }
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
