<template>
  <el-dialog 
    v-model="visible" 
    :title="t('rpa.selectCloudFile')" 
    width="600px" 
    class="ios-dialog"
  >
    <el-table 
      :data="cloudFiles" 
      v-loading="loading" 
      height="400" 
      highlight-current-row 
      @current-change="handleSelection" 
      style="cursor: pointer"
    >
      <el-table-column prop="fileName" :label="t('rpa.name')" />
      <el-table-column prop="size" :label="t('rpa.size')" width="100">
        <template #default="scope">{{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">{{ t('rpa.cancel') }}</el-button>
      <el-button type="primary" @click="confirm" :disabled="!selectedFile">{{ t('rpa.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ListRes } from '@sdk/index';

const props = defineProps<{
  modelValue: boolean;
  cloudFiles: ListRes[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', file: ListRes): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const selectedFile = ref<ListRes | null>(null);

const handleSelection = (row: ListRes) => {
  selectedFile.value = row;
};

const confirm = () => {
  if (selectedFile.value) {
    emit('select', selectedFile.value);
    visible.value = false;
  }
};
</script>
