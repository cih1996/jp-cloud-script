
<template>
  <el-dialog
    v-model="visible"
    :title="$t('changeOs.title')"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="120px" size="small">
      <div class="section-title">{{ $t('changeOs.basic') }}</div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="$t('changeOs.bs')" prop="bs">
            <el-select v-model="form.bs">
              <el-option label="WIFI" value="wifi" />
              <el-option label="Cellular" value="cellular" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.category')" prop="category">
            <el-input v-model="form.category" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.version')" prop="version">
            <el-input v-model="form.version" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">{{ $t('changeOs.location') }}</div>
      <el-row :gutter="20">
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.country')" prop="country">
            <el-input v-model="form.country" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.language')" prop="language">
            <el-input v-model="form.language" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
           <el-form-item :label="$t('changeOs.timezone')" prop="timezone">
            <el-input v-model="form.timezone" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">{{ $t('changeOs.sim') }}</div>
      <el-row :gutter="20">
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.operatorName')" prop="operatorName">
            <el-input v-model="form.operatorName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.operator')" prop="operator">
            <el-input v-model="form.operator" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.mcc')" prop="mcc">
            <el-input v-model="form.mcc" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.mnc')" prop="mnc">
            <el-input v-model="form.mnc" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.msisdn')" prop="msisdn">
            <el-input v-model="form.msisdn" placeholder="Optional" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item :label="$t('changeOs.smsc')" prop="smsc">
            <el-input v-model="form.smsc" placeholder="Optional" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="device-count-info">
        Apply to {{ deviceIds.length }} selected device(s).
      </div>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { ElMessage } from 'element-plus';
import type { ChangeOsReq } from '@sdk/index';

const props = defineProps<{
  modelValue: boolean;
  deviceIds: number[];
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const sdkStore = useSdkStore();
const loading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const form = ref({
  bs: 'wifi',
  category: '491',
  version: '491',
  country: 'us',
  language: 'en-US',
  timezone: 'America/New_York',
  operatorName: 'AmeriLink',
  mcc: '310',
  mnc: '630',
  operator: '00',
  msisdn: '',
  smsc: ''
});

const handleClose = () => {
  visible.value = false;
};

const handleConfirm = async () => {
  if (!sdkStore.sdk) return;
  if (props.deviceIds.length === 0) {
    ElMessage.warning('No devices selected');
    return;
  }

  loading.value = true;
  try {
    const reqs: ChangeOsReq[] = props.deviceIds.map(id => ({
      deviceId: id,
      ...form.value
    }));

    const res = await sdkStore.sdk.changeOsCtl.changeOs(reqs);
    ElMessage.success(`Change OS request sent for ${res.length} devices`);
    emit('success', res);
    visible.value = false;
  } catch (error: any) {
    ElMessage.error('Failed to change OS: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.section-title {
  font-weight: bold;
  margin: 10px 0;
  color: #606266;
  border-left: 3px solid #409EFF;
  padding-left: 8px;
}
.device-count-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f4f4f5;
  color: #909399;
  border-radius: 4px;
  text-align: center;
}
</style>
