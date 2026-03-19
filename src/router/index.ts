
import { createRouter, createWebHistory } from 'vue-router'
import { useSdkStore } from '@/stores/sdkStore'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginView from '@/views/LoginView.vue'
import DeviceListView from '@/views/device/DeviceListView.vue'
import DeviceInspectorView from '@/views/device/DeviceInspectorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/rpa-test',
      name: 'rpaTest',
      component: () => import('@/views/test/RpaSdkTest.vue')
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'deviceList',
          component: DeviceListView
        },
        {
          path: 'device/:id/inspect',
          name: 'deviceInspector',
          component: DeviceInspectorView
        },
        {
          path: 'device/control',
          name: 'deviceControl',
          component: () => import('@/views/device/DeviceControlView.vue')
        },
        {
          path: 'cloud',
          name: 'cloudFile',
          component: () => import('@/views/CloudFile.vue')
        },
        {
          path: 'rpa',
          name: 'rpa',
          component: () => import('@/views/RpaView.vue')
        },
        {
          path: 'rpa/history',
          name: 'rpaHistory',
          component: () => import('@/views/rpa/RpaHistoryView.vue')
        },
        {
          path: 'unified-test',
          name: 'unifiedTest',
          component: () => import('@/views/test/UnifiedTestView.vue')
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/views/system/LogView.vue')
        },
        {
          path: 'protocol',
          name: 'protocol',
          component: () => import('@/views/system/ProtocolDocView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const sdkStore = useSdkStore()

  // If requires auth and not logged in (and no API key in storage/state)
  if (to.meta.requiresAuth && !sdkStore.isLoggedIn && !sdkStore.apiKey) {
    next('/login')
  } else if (to.meta.requiresAuth && !sdkStore.isLoggedIn && sdkStore.apiKey) {
    // 有 apiKey 但未登录（页面刷新场景），自动登录后再放行
    try {
      await sdkStore.login(sdkStore.apiKey, sdkStore.serverHost)
      next()
    } catch {
      // 自动登录失败，清除无效 key，跳转登录页
      sdkStore.apiKey = ''
      localStorage.removeItem('jpy_api_key')
      next('/login')
    }
  } else if (to.path === '/login' && sdkStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
