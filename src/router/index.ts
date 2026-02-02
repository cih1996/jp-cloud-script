
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
          path: 'unified-test',
          name: 'unifiedTest',
          component: () => import('@/views/test/UnifiedTestView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const sdkStore = useSdkStore()
  
  // Try to initialize SDK if not already done (e.g. page refresh)
  if (!sdkStore.sdk) {
    sdkStore.initSdk()
  }

  // If requires auth and not logged in (and no API key in storage/state)
  if (to.meta.requiresAuth && !sdkStore.isLoggedIn && !sdkStore.apiKey) {
    next('/login')
  } else if (to.path === '/login' && (sdkStore.isLoggedIn || sdkStore.apiKey)) {
      // If going to login but already has key, try to redirect home
      // But we need to make sure login is actually valid. 
      // For now let's just allow them to go to login if they really want (e.g. to switch accounts)
      // or redirect if they are fully logged in.
      if (sdkStore.isLoggedIn) {
          next('/')
      } else {
          next()
      }
  } else {
    next()
  }
})

export default router
