
<template>
  <div class="login-container">
    <div class="login-content">
      <div class="brand-section">
        <h1>Cloud Console</h1>
        <p>Enterprise Device Management System</p>
      </div>
      
      <div class="login-card-wrapper">
        <el-card class="login-card" shadow="hover">
          <div class="login-header">
            <h2>{{ $t('login.title') }}</h2>
            <p class="subtitle">Welcome back, please login to your account</p>
          </div>
          
          <el-form 
            ref="loginFormRef"
            :model="form" 
            class="login-form"
            @submit.prevent="handleLogin"
            size="large"
          >
            <el-form-item>
              <el-autocomplete
                v-model="form.host"
                :fetch-suggestions="querySearch"
                placeholder="Server Host (e.g. minio.accjs.cn)"
                style="width: 100%"
                :trigger-on-focus="true"
              >
                <template #prefix>
                  <el-icon><Monitor /></el-icon>
                </template>
                <template #append>
                   <el-button :icon="Delete" @click.stop="clearHistory" title="Clear History" />
                </template>
              </el-autocomplete>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="form.apiKey"
                :placeholder="$t('login.apiKeyPlaceholder')"
                type="text"
                :prefix-icon="Key"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                native-type="submit" 
                :loading="loading" 
                class="login-button"
              >
                {{ $t('login.loginBtn') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSdkStore } from '@/stores/sdkStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Key, Monitor, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()
const router = useRouter()
const sdkStore = useSdkStore()
const loading = ref(false)

const form = ref({
  apiKey: sdkStore.apiKey,
  host: localStorage.getItem('last_host') || 'minio.accjs.cn'
})

const hostHistory = ref<{value: string}[]>([])

onMounted(() => {
    loadHistory()
})

const loadHistory = () => {
    try {
        const hist = JSON.parse(localStorage.getItem('host_history') || '["minio.accjs.cn"]')
        hostHistory.value = hist.map((h: string) => ({ value: h }))
    } catch (e) {
        hostHistory.value = [{ value: 'minio.accjs.cn' }]
    }
}

const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? hostHistory.value.filter(createFilter(queryString))
    : hostHistory.value
  cb(results)
}

const createFilter = (queryString: string) => {
  return (restaurant: { value: string }) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const clearHistory = () => {
    ElMessageBox.confirm(
        'Are you sure you want to clear the host history?',
        'Warning',
        {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning',
        }
      )
        .then(() => {
          hostHistory.value = []
          localStorage.removeItem('host_history')
          ElMessage({
            type: 'success',
            message: 'History cleared',
          })
        })
        .catch(() => {})
}

const handleLogin = async () => {
  if (!form.value.apiKey) {
    ElMessage.warning(t('login.apiKeyRequired'))
    return
  }
  if (!form.value.host) {
      ElMessage.warning('Host is required')
      return
  }
  
  loading.value = true
  try {
    await sdkStore.login(form.value.apiKey, form.value.host)
    
    // Save host to history
    const currentHosts = hostHistory.value.map(h => h.value)
    if (!currentHosts.includes(form.value.host)) {
        currentHosts.unshift(form.value.host)
        localStorage.setItem('host_history', JSON.stringify(currentHosts))
        loadHistory()
    }
    localStorage.setItem('last_host', form.value.host)

    router.push('/')
  } catch (e) {
    // Error handled in store
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
  transform: rotate(30deg);
  pointer-events: none;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 20px;
}

.brand-section {
  text-align: center;
  margin-bottom: 40px;
}

.brand-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.5px;
  background: linear-gradient(120deg, #2563eb, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-section p {
  color: #6b7280;
  margin-top: 8px;
  font-size: 1.1rem;
}

.login-card-wrapper {
  width: 100%;
}

.login-card {
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.login-form {
  padding: 10px 0;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  height: 48px;
  margin-top: 10px;
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  border: none;
  transition: transform 0.2s;
}

.login-button:active {
  transform: scale(0.98);
}
</style>
