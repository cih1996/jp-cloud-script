<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>{{ t('rpa.allShortcuts') }}</h2>
      <div class="header-buttons">
        <el-upload
          :show-file-list="false"
          accept=".json"
          :before-upload="handleImport"
          class="import-uploader"
        >
          <el-button circle class="icon-btn" :title="t('rpa.import')">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-upload>
        <el-button circle class="icon-btn" @click="rpaStore.exportTasks" :title="t('rpa.export')">
          <el-icon><Download /></el-icon>
        </el-button>
        <el-button circle class="add-btn" @click="() => rpaStore.createTask()" :title="t('rpa.create')">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>
    
    <el-scrollbar>
      <div class="shortcut-grid">
        <div 
          v-for="task in rpaStore.tasks" 
          :key="task.id"
          class="shortcut-card"
          :class="{ active: rpaStore.currentTaskId === task.id }"
          @click="rpaStore.selectTask(task.id)"
        >
          <div class="shortcut-icon" :style="{ background: getTaskColor(task.id) }">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="shortcut-info">
            <span class="shortcut-name">{{ task.name }}</span>
            <span class="shortcut-count">{{ task.steps?.length || 0 }} {{ t('common.actions') }}</span>
          </div>
          <div class="shortcut-actions" v-if="rpaStore.currentTaskId === task.id">
             <el-button text circle size="small" type="danger" @click.stop="rpaStore.deleteTask(task.id)">
               <el-icon><Delete /></el-icon>
             </el-button>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRpaStore } from '@/stores/rpaStore';
import { useI18n } from 'vue-i18n';
import { Plus, Delete, Monitor, Download, Upload } from '@element-plus/icons-vue';

const rpaStore = useRpaStore();
const { t } = useI18n();

// 加载流程列表
onMounted(() => {
  rpaStore.loadFlows();
});

const getTaskColor = (id: number | string) => {
    const idStr = String(id);
    const colors = ['#FF2D55', '#5856D6', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA'];
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const handleImport = (file: any) => {
  rpaStore.importTasks(file);
  return false; // Prevent default upload
};
</script>

<style scoped lang="scss">
.sidebar {
  width: 320px;
  background-color: #ffffff;
  border-right: 1px solid #e5e5ea;
  display: flex;
  flex-direction: column;
  z-index: 10;
  
  .sidebar-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f2f2f7;
    
    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #000;
    }
    
    .header-buttons {
        display: flex;
        gap: 8px;
    }

    .icon-btn, .add-btn {
      background-color: #e5e5ea;
      border: none;
      color: #1c1c1e;
      &:hover {
        background-color: #d1d1d6;
      }
    }
    
    .import-uploader {
        display: flex;
    }
  }

  .shortcut-grid {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px;
  }

  .shortcut-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 2px solid transparent;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    &.active {
      border-color: #1c1c1e;
      background-color: #f2f2f7;
    }

    .shortcut-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .shortcut-info {
      display: flex;
      flex-direction: column;

      .shortcut-name {
        font-weight: 600;
        font-size: 15px;
        color: #1c1c1e;
        margin-bottom: 4px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .shortcut-count {
        font-size: 12px;
        color: #8e8e93;
      }
    }
    
    .shortcut-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .shortcut-actions {
      opacity: 1;
    }
  }
}
</style>
