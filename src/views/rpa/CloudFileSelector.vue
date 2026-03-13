<template>
  <el-dialog
    v-model="visible"
    :title="t('rpa.selectCloudFile')"
    width="600px"
    class="ios-dialog"
  >
    <el-table
      ref="tableRef"
      :data="cloudFiles"
      v-loading="loading"
      height="400"
      :highlight-current-row="!multiSelect"
      @current-change="handleSingleSelection"
      @selection-change="handleMultiSelection"
      style="cursor: pointer"
    >
      <el-table-column v-if="multiSelect" type="selection" width="55" />
      <el-table-column prop="fileName" :label="t('rpa.name')" />
      <el-table-column prop="size" :label="t('rpa.size')" width="100">
        <template #default="scope">{{ (scope.row.size / 1024 / 1024).toFixed(2) }} MB</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">{{ t('rpa.cancel') }}</el-button>
      <el-button type="primary" @click="confirm" :disabled="!hasSelection">
        {{ t('rpa.confirm') }}{{ multiSelect && selectedFiles.length > 0 ? ` (${selectedFiles.length})` : '' }}
      </el-button>
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
  multiSelect?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', file: ListRes): void;
  (e: 'select-multi', files: ListRes[]): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const selectedFile = ref<ListRes | null>(null);
const selectedFiles = ref<ListRes[]>([]);

const hasSelection = computed(() => {
  if (props.multiSelect) {
    return selectedFiles.value.length > 0;
  }
  return selectedFile.value !== null;
});

const handleSingleSelection = (row: ListRes) => {
  if (!props.multiSelect) {
    selectedFile.value = row;
  }
};

const handleMultiSelection = (rows: ListRes[]) => {
  if (props.multiSelect) {
    selectedFiles.value = rows;
  }
};

const confirm = () => {
  if (props.multiSelect) {
    if (selectedFiles.value.length > 0) {
      emit('select-multi', selectedFiles.value);
      visible.value = false;
    }
  } else {
    if (selectedFile.value) {
      emit('select', selectedFile.value);
      visible.value = false;
    }
  }
};
</script>
