<!-- 操作库抽屉组件 -->
<template>
  <el-drawer
    v-model="visible"
    :title="t('rpa.actionLibrary')"
    direction="rtl"
    size="400px"
    class="action-drawer"
  >
    <div class="action-library">
       <div class="library-search">
          <el-input v-model="actionSearch" prefix-icon="Search" :placeholder="t('rpa.searchActions')" class="ios-search" />
       </div>
       <div class="library-categories">
          <div v-for="(category, catName) in filteredActions" :key="catName" class="library-category">
             <h4>{{ t(`rpa.categories.${catName}`) }}</h4>
             <div class="library-grid">
                <div 
                  v-for="action in category" 
                  :key="action.type" 
                  class="library-item"
                  @click="addStep(action.type)"
                >
                   <div class="library-icon" :style="getStepStyle(action.type)">
                      <component :is="getStepStyle(action.type).icon" />
                   </div>
                   <span>{{ action.label }}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getStepStyle } from '@/utils/rpaHelpers';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'add-step', type: string): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const actionSearch = ref('');

const actionCategories = computed(() => ({
    'system': [
        { type: 'change_os_and_wait', label: '改机重启' },
        { type: 'set_proxy_and_wait', label: '设置代理' },
        { type: 'set_location', label: '设置定位' },
        { type: 'install_app_and_wait', label: '安装应用' },
        { type: 'get_root', label: '应用提权' }
    ],
    'network': [
        { type: 'download_url', label: 'URL下载' },
        { type: 'download_cloud', label: '云端下载' },
        { type: 'http_request', label: 'HTTP请求' }
    ],
    'scripting': [
        { type: 'shell', label: 'Shell命令' },
        { type: 'run_script_and_wait', label: '运行脚本' }
    ]
}));

const filteredActions = computed(() => {
    if (!actionSearch.value) return actionCategories.value;
    const q = actionSearch.value.toLowerCase();
    const result: Record<string, any[]> = {};
    
    for (const [cat, actions] of Object.entries(actionCategories.value)) {
        const filtered = actions.filter(a => a.label.toLowerCase().includes(q));
        if (filtered.length > 0) {
            result[cat] = filtered;
        }
    }
    return result;
});

const addStep = (type: string) => {
  emit('add-step', type);
  visible.value = false;
};
</script>

<style scoped lang="scss">
.action-library {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.library-search {
  padding-bottom: 10px;
  .ios-search {
    :deep(.el-input__wrapper) {
      background-color: #f2f2f7;
      border-radius: 10px;
      box-shadow: none;
    }
  }
}

.library-category {
  h4 {
    margin: 0 0 10px 0;
    font-size: 13px;
    text-transform: uppercase;
    color: #8e8e93;
    letter-spacing: 0.5px;
  }
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.library-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f2f2f7;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e5e5ea;
  }
  
  .library-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #000;
  }
}
</style>
