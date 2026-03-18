
<!-- 
  主布局组件
  包含左侧导航栏、顶部标题栏和主要内容区域
-->
<template>
  <el-container class="layout-container">
    <el-aside width="260px" class="aside">
      <div class="logo-container">
        <div class="logo-icon">C</div>
        <div class="logo-content">
          <span class="logo-text">{{ $t('appName') }}</span>
          <span class="host-text" v-if="currentHost" :title="currentHost">{{ currentHost }}</span>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        :collapse="false"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>{{ $t('menu.deviceList') }}</span>
        </el-menu-item>
        <el-menu-item index="/device/control">
          <el-icon><Pointer /></el-icon>
          <span>{{ $t('menu.deviceControl') }}</span>
        </el-menu-item>
        <el-menu-item index="/cloud">
          <el-icon><Files /></el-icon>
          <span>{{ $t('menu.cloudFile') }}</span>
        </el-menu-item>
        <el-menu-item index="/rpa">
          <el-icon><VideoPlay /></el-icon>
          <span>{{ $t('menu.rpa') }}</span>
        </el-menu-item>
        <el-menu-item index="/unified-test">
          <el-icon><Connection /></el-icon>
          <span>{{ $t('menu.unifiedTest') }}</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>{{ $t('menu.logs') }}</span>
        </el-menu-item>
        <el-menu-item index="/protocol">
          <el-icon><Notebook /></el-icon>
          <span>协议手册</span>
        </el-menu-item>
      </el-menu>
      
      <ServiceStatus />
    </el-aside>
    
    <el-container class="main-content-wrapper">
      <el-header class="header">
        <div class="header-content">
          <div class="breadcrumb-area">
             <h2 class="page-title">{{ $t(`menu.${String(route.name)}`) || route.name }}</h2>
          </div>
          <div class="header-right">
             <el-dropdown @command="handleLangCommand" trigger="click" class="lang-dropdown">
               <span class="el-dropdown-link">
                 {{ currentLang === 'zh-CN' ? '中文' : 'English' }}
                 <el-icon class="el-icon--right"><arrow-down /></el-icon>
               </span>
               <template #dropdown>
                 <el-dropdown-menu>
                   <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                   <el-dropdown-item command="en-US">English</el-dropdown-item>
                 </el-dropdown-menu>
               </template>
             </el-dropdown>
             <div class="user-profile">
               <el-avatar :size="32" class="user-avatar">U</el-avatar>
               <el-dropdown @command="handleCommand" trigger="click">
                  <span class="el-dropdown-link">
                    Admin User <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu class="user-dropdown">
                      <el-dropdown-item command="logout" class="danger-text">{{ $t('common.logout') }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
             </div>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['DeviceControlView', 'RpaView', 'UnifiedTestView']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSdkStore } from '@/stores/sdkStore'
import { useI18n } from 'vue-i18n'
import { Monitor, ArrowDown, Files, VideoPlay, Connection, Document, Pointer, Notebook } from '@element-plus/icons-vue'
import ServiceStatus from '@/components/ServiceStatus.vue'
import { useFrontendWS } from '@/composables/useFrontendWS'

const route = useRoute()
const router = useRouter()
const sdkStore = useSdkStore()
const { locale } = useI18n()
const { serverStatus, subscribe, unsubscribe } = useFrontendWS()

// 从 WS 订阅获取服务器状态，回退到 localStorage
const currentHost = computed(() => serverStatus.value.host || localStorage.getItem('last_host') || '')

const activeMenu = computed(() => route.path)
const currentLang = computed(() => locale.value)

onMounted(() => {
  subscribe('server_status')
})

onUnmounted(() => {
  unsubscribe('server_status')
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    sdkStore.logout()
    router.push('/login')
  }
}

const handleLangCommand = (lang: string) => {
  locale.value = lang
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f3f4f6;
  overflow: hidden; /* Fix layout overflow */
}

.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.lang-dropdown {
  margin-right: 20px;
  cursor: pointer;
  color: #606266;
  display: flex;
  align-items: center;
  height: 100%;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  outline: none;
}

.aside {
  background-color: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f6;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.logo-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.host-text {
  font-size: 11px;
  color: #9ca3af;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
  padding: 16px 0;
  flex: 1;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 16px;
  border-radius: 8px;
  color: #4b5563;
}

:deep(.el-menu-item.is-active) {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

:deep(.el-menu-item:hover) {
  background-color: #f9fafb;
}

.header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  height: 64px;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.user-profile:hover {
  background-color: #f3f4f6;
}

.user-avatar {
  background-color: #dbeafe;
  color: #2563eb;
  font-weight: 600;
}

.el-dropdown-link {
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
}

.main-content {
  padding: 0;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.danger-text {
  color: #dc2626;
}
</style>
